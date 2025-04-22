// Data Service for interacting with the Mock Database
import mockDb from './mock-database-system.jsx';

class DataService {
  constructor() {
    this.db = mockDb;
  }

  // Get all available data sources/tables with their metadata
  getDataSources() {
    return this.db.dataCategories.map(category => {
      // Get the tables in this category and enhance with record counts
      const tables = category.tables.map(tableName => {
        const count = this.db.query(tableName).count();
        const schema = this.db.schemas[tableName];
        const primaryKey = schema ? schema.fields.find(field => field.primary)?.name || 'id' : 'id';
        
        return {
          name: tableName,
          displayName: this.formatTableName(tableName),
          count,
          primaryKey,
          hasRelations: schema?.relationships?.length > 0 || false
        };
      });
      
      return {
        id: category.id,
        name: category.name,
        description: category.description,
        color: category.color,
        icon: category.icon,
        tables
      };
    });
  }
  
  // Format table name for display (users -> Users, orderItems -> Order Items)
  formatTableName(tableName) {
    return tableName
      .replace(/([A-Z])/g, ' $1')  // Insert a space before capital letters
      .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
      .trim();
  }
  
  // Get schema for a specific table
  getTableSchema(tableName) {
    const schema = this.db.schemas[tableName];
    if (!schema) {
      throw new Error(`Schema not found for table: ${tableName}`);
    }
    
    return {
      fields: schema.fields.map(field => ({
        name: field.name,
        type: field.type,
        primary: !!field.primary,
        unique: !!field.unique,
        nullable: !!field.nullable,
        references: field.references,
        enum: field.enum
      })),
      relationships: schema.relationships.map(rel => ({
        type: rel.type,
        table: rel.table,
        foreignKey: rel.foreignKey,
        through: rel.through,
        targetKey: rel.targetKey,
        as: rel.as
      }))
    };
  }
  
  // Get data from a specific table with optional filters
  getTableData(tableName, options = {}) {
    const { filters, sort, page, pageSize, includes } = options;
    
    let query = this.db.query(tableName);
    
    // Apply filters if provided
    if (filters && Array.isArray(filters)) {
      filters.forEach(filter => {
        query = query.where(filter.field, filter.operator || '=', filter.value);
      });
    }
    
    // Apply sorting if provided
    if (sort) {
      query = query.orderBy(sort.field, sort.direction || 'asc');
    }
    
    // Apply includes if provided
    if (includes && Array.isArray(includes)) {
      includes.forEach(include => {
        query = query.include(include);
      });
    }
    
    // Get total count before pagination
    const total = query.count();
    
    // Apply pagination if provided
    if (page !== undefined && pageSize !== undefined) {
      query = query.offset((page - 1) * pageSize).limit(pageSize);
    }
    
    const data = query.get();
    
    return {
      data,
      meta: {
        total,
        page: page || 1,
        pageSize: pageSize || total,
        pageCount: pageSize ? Math.ceil(total / pageSize) : 1
      }
    };
  }
  
  // Get a single record by ID
  getRecordById(tableName, id, includes = []) {
    let query = this.db.query(tableName);
    
    // Apply includes if provided
    if (includes && Array.isArray(includes)) {
      includes.forEach(include => {
        query = query.include(include);
      });
    }
    
    return query.find(id);
  }
  
  // Create a new record
  createRecord(tableName, data) {
    return this.db.query(tableName).create(data);
  }
  
  // Update a record
  updateRecord(tableName, id, data) {
    return this.db.query(tableName).where('id', id).update(data);
  }
  
  // Delete a record
  deleteRecord(tableName, id) {
    return this.db.query(tableName).where('id', id).delete();
  }
  
  // Get related records for a specific record
  getRelatedRecords(tableName, id, relationName) {
    const schema = this.db.schemas[tableName];
    if (!schema) {
      throw new Error(`Schema not found for table: ${tableName}`);
    }
    
    const relationship = schema.relationships.find(rel => {
      if (rel.as) {
        return rel.as === relationName;
      }
      return rel.table === relationName;
    });
    
    if (!relationship) {
      throw new Error(`Relationship ${relationName} not found for table: ${tableName}`);
    }
    
    const record = this.getRecordById(tableName, id);
    if (!record) {
      throw new Error(`Record with ID ${id} not found in table: ${tableName}`);
    }
    
    switch (relationship.type) {
      case 'hasOne':
      case 'belongsTo':
        const foreignKey = relationship.foreignKey;
        const targetTable = relationship.table;
        const targetRecord = this.db.query(targetTable).find(record[foreignKey]);
        return targetRecord;
        
      case 'hasMany':
        const hasManyForeignKey = relationship.foreignKey;
        const hasManyTable = relationship.table;
        return this.db.query(hasManyTable).where(hasManyForeignKey, id).get();
        
      case 'belongsToMany':
        const throughTable = relationship.through;
        const throughForeignKey = relationship.foreignKey;
        const targetKey = relationship.targetKey;
        const targetBelongsToManyTable = relationship.table;
        
        // First get all records from the join table
        const joinRecords = this.db.query(throughTable).where(throughForeignKey, id).get();
        
        // Then get the target IDs
        const targetIds = joinRecords.map(jr => jr[targetKey]);
        
        // Finally get the related records
        return this.db.query(targetBelongsToManyTable).where('id', 'in', targetIds).get();
        
      default:
        throw new Error(`Unsupported relationship type: ${relationship.type}`);
    }
  }
  
  // Run a query with complex filters and joins
  runQuery(query) {
    const { table, filters, joins, fields, groupBy, aggregate, sort, limit } = query;
    
    if (!table) {
      throw new Error('Table name is required for running a query');
    }
    
    // Start building the query
    let dbQuery = this.db.query(table);
    
    // Apply filters if provided
    if (filters && Array.isArray(filters)) {
      filters.forEach(filter => {
        dbQuery = dbQuery.where(filter.field, filter.operator || '=', filter.value);
      });
    }
    
    // Apply joins/includes if provided
    if (joins && Array.isArray(joins)) {
      joins.forEach(join => {
        dbQuery = dbQuery.include(join.table);
      });
    }
    
    // Apply sorting if provided
    if (sort) {
      dbQuery = dbQuery.orderBy(sort.field, sort.direction || 'asc');
    }
    
    // Apply limit if provided
    if (limit) {
      dbQuery = dbQuery.limit(limit);
    }
    
    // Execute the query
    const results = dbQuery.get();
    
    // If grouping and aggregation is requested (not fully implemented)
    if (groupBy && aggregate) {
      // This would be a more complex implementation
      // For now, we'll return a simplified result
      console.warn('Complex grouping and aggregation is not fully implemented in the mock database');
    }
    
    // If specific fields are requested, filter them
    if (fields && Array.isArray(fields) && fields.length > 0) {
      return results.map(result => {
        const filtered = {};
        fields.forEach(field => {
          filtered[field] = result[field];
        });
        return filtered;
      });
    }
    
    return results;
  }
  
  // Get database statistics for dashboard
  getDatabaseStats() {
    const stats = {
      totalRecords: 0,
      tablesCount: 0,
      categoriesCount: this.db.dataCategories.length,
      tables: {},
      recentActivity: []
    };
    
    // Calculate total records and per-table stats
    Object.keys(this.db.schemas).forEach(tableName => {
      const count = this.db.query(tableName).count();
      stats.totalRecords += count;
      stats.tablesCount++;
      stats.tables[tableName] = count;
    });
    
    // Get recent user activities
    stats.recentActivity = this.db.query('userActivities')
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();
    
    return stats;
  }
}

// Create and export a singleton instance
const dataService = new DataService();
export default dataService;