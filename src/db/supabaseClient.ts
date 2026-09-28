import { seedData } from './seedData'

export const isSupabaseConfigured = true;

function getLocalData() {
  const data = localStorage.getItem('demo_db');
  if (data) return JSON.parse(data);
  const initial = seedData();
  localStorage.setItem('demo_db', JSON.stringify(initial));
  return initial;
}

function saveLocalData(data: any) {
  localStorage.setItem('demo_db', JSON.stringify(data));
}

class MockQueryBuilder {
  action = 'select';
  payload: any = null;
  filters: any[] = [];
  orders: any[] = [];
  limitCount: number = 0;
  isSingle = false;

  constructor(public table: string) {}

  select(columns: string = '*') {
    this.action = 'select';
    return this;
  }
  
  insert(data: any) {
    this.action = 'insert';
    this.payload = data;
    return this;
  }

  update(data: any) {
    this.action = 'update';
    this.payload = data;
    return this;
  }

  delete() {
    this.action = 'delete';
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push({ column, value });
    return this;
  }
  
  order(column: string, options?: { ascending: boolean }) {
    this.orders.push({ column, ascending: options?.ascending !== false });
    return this;
  }

  limit(n: number) {
    this.limitCount = n;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  async then(resolve: any, reject?: any) {
    let result = null;
    try {
        const db = getLocalData();
        let tableData = db[this.table] || [];
        
        if (this.action === 'select') {
           let res = [...tableData];
           for (let f of this.filters) res = res.filter((x: any) => x[f.column] === f.value);
           for (let o of this.orders) {
              res.sort((a: any, b: any) => {
                 if (a[o.column] < b[o.column]) return o.ascending ? -1 : 1;
                 if (a[o.column] > b[o.column]) return o.ascending ? 1 : -1;
                 return 0;
              });
           }
           if (this.limitCount) res = res.slice(0, this.limitCount);
           
           if (this.isSingle) {
              result = res[0] || null;
           } else {
              result = res;
           }
        } else if (this.action === 'insert') {
           const newItem = { id: crypto.randomUUID(), created_at: new Date().toISOString(), ...this.payload };
           tableData.push(newItem);
           db[this.table] = tableData;
           saveLocalData(db);
           if (this.isSingle) {
              result = newItem;
           } else {
              result = [newItem];
           }
        } else if (this.action === 'update') {
           let updated = null;
           tableData = tableData.map((item: any) => {
              let match = true;
              for (let f of this.filters) if (item[f.column] !== f.value) match = false;
              if (match) {
                 updated = { ...item, ...this.payload };
                 return updated;
              }
              return item;
           });
           db[this.table] = tableData;
           saveLocalData(db);
           result = updated;
        } else if (this.action === 'delete') {
           tableData = tableData.filter((item: any) => {
              let match = true;
              for (let f of this.filters) if (item[f.column] !== f.value) match = false;
              return !match;
           });
           db[this.table] = tableData;
           saveLocalData(db);
           result = null;
        }
        
        resolve({ data: result, error: null });
    } catch(err) {
        resolve({ data: null, error: err });
    }
  }
}

export const supabase = {
  from: (table: string) => new MockQueryBuilder(table)
};
