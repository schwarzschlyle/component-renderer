// Mock Database System with Complex Relationships
// This file defines a comprehensive mock database with realistic relationships
// between entities and provides localStorage persistence

class MockDatabase {
    constructor() {
        this.initialized = false;
        this.schemas = {
            users: {
                fields: [
                    { name: 'id', type: 'integer', primary: true },
                    { name: 'firstName', type: 'string' },
                    { name: 'lastName', type: 'string' },
                    { name: 'email', type: 'string', unique: true },
                    { name: 'phoneNumber', type: 'string' },
                    { name: 'addressId', type: 'integer', references: { table: 'addresses', field: 'id' } },
                    { name: 'roleId', type: 'integer', references: { table: 'roles', field: 'id' } },
                    { name: 'companyId', type: 'integer', references: { table: 'companies', field: 'id' } },
                    { name: 'departmentId', type: 'integer', references: { table: 'departments', field: 'id' } },
                    { name: 'avatar', type: 'string' },
                    { name: 'preferences', type: 'json' },
                    { name: 'status', type: 'string', enum: ['active', 'inactive', 'pending', 'blocked'] },
                    { name: 'lastLoginAt', type: 'datetime' },
                    { name: 'createdAt', type: 'datetime' },
                    { name: 'updatedAt', type: 'datetime' }
                ],
                relationships: [
                    { type: 'hasMany', table: 'orders', foreignKey: 'userId' },
                    { type: 'hasMany', table: 'reviews', foreignKey: 'userId' },
                    { type: 'hasMany', table: 'userActivities', foreignKey: 'userId' },
                    { type: 'hasMany', table: 'tickets', foreignKey: 'userId' },
                    { type: 'belongsTo', table: 'addresses', foreignKey: 'addressId' },
                    { type: 'belongsTo', table: 'roles', foreignKey: 'roleId' },
                    { type: 'belongsTo', table: 'companies', foreignKey: 'companyId' },
                    { type: 'belongsTo', table: 'departments', foreignKey: 'departmentId' }
                ]
            },
            roles: {
                fields: [
                    { name: 'id', type: 'integer', primary: true },
                    { name: 'name', type: 'string', unique: true },
                    { name: 'description', type: 'string' },
                    { name: 'permissions', type: 'json' },
                    { name: 'createdAt', type: 'datetime' },
                    { name: 'updatedAt', type: 'datetime' }
                ],
                relationships: [
                    { type: 'hasMany', table: 'users', foreignKey: 'roleId' }
                ]
            },
            companies: {
                fields: [
                    { name: 'id', type: 'integer', primary: true },
                    { name: 'name', type: 'string' },
                    { name: 'industry', type: 'string' },
                    { name: 'addressId', type: 'integer', references: { table: 'addresses', field: 'id' } },
                    { name: 'website', type: 'string' },
                    { name: 'logoUrl', type: 'string' },
                    { name: 'status', type: 'string', enum: ['active', 'inactive'] },
                    { name: 'foundedYear', type: 'integer' },
                    { name: 'createdAt', type: 'datetime' },
                    { name: 'updatedAt', type: 'datetime' }
                ],
                relationships: [
                    { type: 'hasMany', table: 'users', foreignKey: 'companyId' },
                    { type: 'hasMany', table: 'departments', foreignKey: 'companyId' },
                    { type: 'belongsTo', table: 'addresses', foreignKey: 'addressId' }
                ]
            },
            departments: {
                fields: [
                    { name: 'id', type: 'integer', primary: true },
                    { name: 'name', type: 'string' },
                    { name: 'description', type: 'string' },
                    { name: 'companyId', type: 'integer', references: { table: 'companies', field: 'id' } },
                    { name: 'managerId', type: 'integer', references: { table: 'users', field: 'id' } },
                    { name: 'budget', type: 'decimal' },
                    { name: 'createdAt', type: 'datetime' },
                    { name: 'updatedAt', type: 'datetime' }
                ],
                relationships: [
                    { type: 'hasMany', table: 'users', foreignKey: 'departmentId' },
                    { type: 'belongsTo', table: 'companies', foreignKey: 'companyId' },
                    { type: 'belongsTo', table: 'users', foreignKey: 'managerId', as: 'manager' }
                ]
            },
            addresses: {
                fields: [
                    { name: 'id', type: 'integer', primary: true },
                    { name: 'street', type: 'string' },
                    { name: 'city', type: 'string' },
                    { name: 'state', type: 'string' },
                    { name: 'zipCode', type: 'string' },
                    { name: 'country', type: 'string' },
                    { name: 'latitude', type: 'decimal' },
                    { name: 'longitude', type: 'decimal' },
                    { name: 'createdAt', type: 'datetime' },
                    { name: 'updatedAt', type: 'datetime' }
                ],
                relationships: [
                    { type: 'hasMany', table: 'users', foreignKey: 'addressId' },
                    { type: 'hasMany', table: 'companies', foreignKey: 'addressId' }
                ]
            },
            products: {
                fields: [
                    { name: 'id', type: 'integer', primary: true },
                    { name: 'name', type: 'string' },
                    { name: 'description', type: 'string' },
                    { name: 'price', type: 'decimal' },
                    { name: 'salePrice', type: 'decimal', nullable: true },
                    { name: 'categoryId', type: 'integer', references: { table: 'categories', field: 'id' } },
                    { name: 'brandId', type: 'integer', references: { table: 'brands', field: 'id' } },
                    { name: 'sku', type: 'string', unique: true },
                    { name: 'stock', type: 'integer' },
                    { name: 'weight', type: 'decimal' },
                    { name: 'dimensions', type: 'json' },
                    { name: 'isPublished', type: 'boolean' },
                    { name: 'isFeatured', type: 'boolean' },
                    { name: 'tags', type: 'array' },
                    { name: 'createdAt', type: 'datetime' },
                    { name: 'updatedAt', type: 'datetime' }
                ],
                relationships: [
                    { type: 'hasMany', table: 'productImages', foreignKey: 'productId' },
                    { type: 'hasMany', table: 'reviews', foreignKey: 'productId' },
                    { type: 'hasMany', table: 'inventoryItems', foreignKey: 'productId' },
                    { type: 'belongsToMany', table: 'orders', through: 'orderItems', foreignKey: 'productId', targetKey: 'orderId' },
                    { type: 'belongsTo', table: 'categories', foreignKey: 'categoryId' },
                    { type: 'belongsTo', table: 'brands', foreignKey: 'brandId' }
                ]
            },
            categories: {
                fields: [
                    { name: 'id', type: 'integer', primary: true },
                    { name: 'name', type: 'string' },
                    { name: 'description', type: 'string' },
                    { name: 'slug', type: 'string', unique: true },
                    { name: 'parentId', type: 'integer', references: { table: 'categories', field: 'id' }, nullable: true },
                    { name: 'isActive', type: 'boolean' },
                    { name: 'imageUrl', type: 'string' },
                    { name: 'position', type: 'integer' },
                    { name: 'createdAt', type: 'datetime' },
                    { name: 'updatedAt', type: 'datetime' }
                ],
                relationships: [
                    { type: 'hasMany', table: 'products', foreignKey: 'categoryId' },
                    { type: 'hasMany', table: 'categories', foreignKey: 'parentId', as: 'subcategories' },
                    { type: 'belongsTo', table: 'categories', foreignKey: 'parentId', as: 'parent' }
                ]
            },
            brands: {
                fields: [
                    { name: 'id', type: 'integer', primary: true },
                    { name: 'name', type: 'string' },
                    { name: 'description', type: 'string' },
                    { name: 'logo', type: 'string' },
                    { name: 'website', type: 'string' },
                    { name: 'foundedYear', type: 'integer' },
                    { name: 'origin', type: 'string' },
                    { name: 'createdAt', type: 'datetime' },
                    { name: 'updatedAt', type: 'datetime' }
                ],
                relationships: [
                    { type: 'hasMany', table: 'products', foreignKey: 'brandId' }
                ]
            },
            productImages: {
                fields: [
                    { name: 'id', type: 'integer', primary: true },
                    { name: 'productId', type: 'integer', references: { table: 'products', field: 'id' } },
                    { name: 'url', type: 'string' },
                    { name: 'alt', type: 'string' },
                    { name: 'position', type: 'integer' },
                    { name: 'isPrimary', type: 'boolean' },
                    { name: 'createdAt', type: 'datetime' },
                    { name: 'updatedAt', type: 'datetime' }
                ],
                relationships: [
                    { type: 'belongsTo', table: 'products', foreignKey: 'productId' }
                ]
            },
            orders: {
                fields: [
                    { name: 'id', type: 'integer', primary: true },
                    { name: 'userId', type: 'integer', references: { table: 'users', field: 'id' } },
                    { name: 'orderNumber', type: 'string', unique: true },
                    { name: 'status', type: 'string', enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] },
                    { name: 'totalAmount', type: 'decimal' },
                    { name: 'tax', type: 'decimal' },
                    { name: 'shipping', type: 'decimal' },
                    { name: 'discountAmount', type: 'decimal' },
                    { name: 'couponCode', type: 'string', nullable: true },
                    { name: 'shippingAddressId', type: 'integer', references: { table: 'addresses', field: 'id' } },
                    { name: 'billingAddressId', type: 'integer', references: { table: 'addresses', field: 'id' } },
                    { name: 'paymentMethod', type: 'string', enum: ['credit_card', 'paypal', 'bank_transfer', 'cash_on_delivery'] },
                    { name: 'paymentStatus', type: 'string', enum: ['pending', 'paid', 'failed', 'refunded'] },
                    { name: 'notes', type: 'string' },
                    { name: 'estimatedDeliveryDate', type: 'date', nullable: true },
                    { name: 'trackingNumber', type: 'string', nullable: true },
                    { name: 'createdAt', type: 'datetime' },
                    { name: 'updatedAt', type: 'datetime' }
                ],
                relationships: [
                    { type: 'hasMany', table: 'orderItems', foreignKey: 'orderId' },
                    { type: 'belongsTo', table: 'users', foreignKey: 'userId' },
                    { type: 'belongsTo', table: 'addresses', foreignKey: 'shippingAddressId', as: 'shippingAddress' },
                    { type: 'belongsTo', table: 'addresses', foreignKey: 'billingAddressId', as: 'billingAddress' },
                    { type: 'belongsToMany', table: 'products', through: 'orderItems', foreignKey: 'orderId', targetKey: 'productId' }
                ]
            },
            orderItems: {
                fields: [
                    { name: 'id', type: 'integer', primary: true },
                    { name: 'orderId', type: 'integer', references: { table: 'orders', field: 'id' } },
                    { name: 'productId', type: 'integer', references: { table: 'products', field: 'id' } },
                    { name: 'quantity', type: 'integer' },
                    { name: 'unitPrice', type: 'decimal' },
                    { name: 'totalPrice', type: 'decimal' },
                    { name: 'discount', type: 'decimal' },
                    { name: 'notes', type: 'string' },
                    { name: 'createdAt', type: 'datetime' },
                    { name: 'updatedAt', type: 'datetime' }
                ],
                relationships: [
                    { type: 'belongsTo', table: 'orders', foreignKey: 'orderId' },
                    { type: 'belongsTo', table: 'products', foreignKey: 'productId' }
                ]
            },
            reviews: {
                fields: [
                    { name: 'id', type: 'integer', primary: true },
                    { name: 'userId', type: 'integer', references: { table: 'users', field: 'id' } },
                    { name: 'productId', type: 'integer', references: { table: 'products', field: 'id' } },
                    { name: 'rating', type: 'integer' },
                    { name: 'title', type: 'string' },
                    { name: 'content', type: 'text' },
                    { name: 'isVerifiedPurchase', type: 'boolean' },
                    { name: 'helpfulCount', type: 'integer' },
                    { name: 'reportCount', type: 'integer' },
                    { name: 'status', type: 'string', enum: ['pending', 'approved', 'rejected'] },
                    { name: 'createdAt', type: 'datetime' },
                    { name: 'updatedAt', type: 'datetime' }
                ],
                relationships: [
                    { type: 'belongsTo', table: 'users', foreignKey: 'userId' },
                    { type: 'belongsTo', table: 'products', foreignKey: 'productId' },
                    { type: 'hasMany', table: 'reviewImages', foreignKey: 'reviewId' }
                ]
            },
            reviewImages: {
                fields: [
                    { name: 'id', type: 'integer', primary: true },
                    { name: 'reviewId', type: 'integer', references: { table: 'reviews', field: 'id' } },
                    { name: 'url', type: 'string' },
                    { name: 'caption', type: 'string' },
                    { name: 'createdAt', type: 'datetime' },
                    { name: 'updatedAt', type: 'datetime' }
                ],
                relationships: [
                    { type: 'belongsTo', table: 'reviews', foreignKey: 'reviewId' }
                ]
            },
            inventoryItems: {
                fields: [
                    { name: 'id', type: 'integer', primary: true },
                    { name: 'productId', type: 'integer', references: { table: 'products', field: 'id' } },
                    { name: 'warehouseId', type: 'integer', references: { table: 'warehouses', field: 'id' } },
                    { name: 'quantity', type: 'integer' },
                    { name: 'reservedQuantity', type: 'integer' },
                    { name: 'shelfLocation', type: 'string' },
                    { name: 'reorderLevel', type: 'integer' },
                    { name: 'lastRestockedAt', type: 'datetime' },
                    { name: 'createdAt', type: 'datetime' },
                    { name: 'updatedAt', type: 'datetime' }
                ],
                relationships: [
                    { type: 'belongsTo', table: 'products', foreignKey: 'productId' },
                    { type: 'belongsTo', table: 'warehouses', foreignKey: 'warehouseId' }
                ]
            },
            warehouses: {
                fields: [
                    { name: 'id', type: 'integer', primary: true },
                    { name: 'name', type: 'string' },
                    { name: 'addressId', type: 'integer', references: { table: 'addresses', field: 'id' } },
                    { name: 'managerId', type: 'integer', references: { table: 'users', field: 'id' } },
                    { name: 'phone', type: 'string' },
                    { name: 'email', type: 'string' },
                    { name: 'capacity', type: 'integer' },
                    { name: 'isActive', type: 'boolean' },
                    { name: 'createdAt', type: 'datetime' },
                    { name: 'updatedAt', type: 'datetime' }
                ],
                relationships: [
                    { type: 'hasMany', table: 'inventoryItems', foreignKey: 'warehouseId' },
                    { type: 'belongsTo', table: 'addresses', foreignKey: 'addressId' },
                    { type: 'belongsTo', table: 'users', foreignKey: 'managerId', as: 'manager' }
                ]
            },
            analytics: {
                fields: [
                    { name: 'id', type: 'integer', primary: true },
                    { name: 'date', type: 'date' },
                    { name: 'pageViews', type: 'integer' },
                    { name: 'uniqueVisitors', type: 'integer' },
                    { name: 'newUsers', type: 'integer' },
                    { name: 'bounceRate', type: 'decimal' },
                    { name: 'avgSessionDuration', type: 'integer' }, // in seconds
                    { name: 'trafficSource', type: 'string' },
                    { name: 'deviceType', type: 'string', enum: ['desktop', 'mobile', 'tablet'] },
                    { name: 'browser', type: 'string' },
                    { name: 'country', type: 'string' },
                    { name: 'createdAt', type: 'datetime' },
                    { name: 'updatedAt', type: 'datetime' }
                ],
                relationships: []
            },
            userActivities: {
                fields: [
                    { name: 'id', type: 'integer', primary: true },
                    { name: 'userId', type: 'integer', references: { table: 'users', field: 'id' } },
                    { name: 'activityType', type: 'string', enum: ['login', 'logout', 'purchase', 'view_product', 'add_to_cart', 'remove_from_cart', 'search'] },
                    { name: 'details', type: 'json' },
                    { name: 'ipAddress', type: 'string' },
                    { name: 'userAgent', type: 'string' },
                    { name: 'sessionId', type: 'string' },
                    { name: 'createdAt', type: 'datetime' }
                ],
                relationships: [
                    { type: 'belongsTo', table: 'users', foreignKey: 'userId' }
                ]
            },
            tickets: {
                fields: [
                    { name: 'id', type: 'integer', primary: true },
                    { name: 'userId', type: 'integer', references: { table: 'users', field: 'id' } },
                    { name: 'assigneeId', type: 'integer', references: { table: 'users', field: 'id' }, nullable: true },
                    { name: 'ticketNumber', type: 'string', unique: true },
                    { name: 'subject', type: 'string' },
                    { name: 'description', type: 'text' },
                    { name: 'status', type: 'string', enum: ['open', 'in_progress', 'resolved', 'closed', 'reopened'] },
                    { name: 'priority', type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
                    { name: 'category', type: 'string' },
                    { name: 'createdAt', type: 'datetime' },
                    { name: 'updatedAt', type: 'datetime' },
                    { name: 'closedAt', type: 'datetime', nullable: true }
                ],
                relationships: [
                    { type: 'belongsTo', table: 'users', foreignKey: 'userId' },
                    { type: 'belongsTo', table: 'users', foreignKey: 'assigneeId', as: 'assignee' },
                    { type: 'hasMany', table: 'ticketComments', foreignKey: 'ticketId' },
                    { type: 'hasMany', table: 'ticketAttachments', foreignKey: 'ticketId' }
                ]
            },
            ticketComments: {
                fields: [
                    { name: 'id', type: 'integer', primary: true },
                    { name: 'ticketId', type: 'integer', references: { table: 'tickets', field: 'id' } },
                    { name: 'userId', type: 'integer', references: { table: 'users', field: 'id' } },
                    { name: 'content', type: 'text' },
                    { name: 'isInternal', type: 'boolean' },
                    { name: 'createdAt', type: 'datetime' },
                    { name: 'updatedAt', type: 'datetime' }
                ],
                relationships: [
                    { type: 'belongsTo', table: 'tickets', foreignKey: 'ticketId' },
                    { type: 'belongsTo', table: 'users', foreignKey: 'userId' },
                    { type: 'hasMany', table: 'ticketAttachments', foreignKey: 'commentId' }
                ]
            },
            ticketAttachments: {
                fields: [
                    { name: 'id', type: 'integer', primary: true },
                    { name: 'ticketId', type: 'integer', references: { table: 'tickets', field: 'id' } },
                    { name: 'commentId', type: 'integer', references: { table: 'ticketComments', field: 'id' }, nullable: true },
                    { name: 'fileName', type: 'string' },
                    { name: 'fileUrl', type: 'string' },
                    { name: 'fileSize', type: 'integer' },
                    { name: 'fileType', type: 'string' },
                    { name: 'createdAt', type: 'datetime' }
                ],
                relationships: [
                    { type: 'belongsTo', table: 'tickets', foreignKey: 'ticketId' },
                    { type: 'belongsTo', table: 'ticketComments', foreignKey: 'commentId' }
                ]
            },
            settings: {
                fields: [
                    { name: 'id', type: 'integer', primary: true },
                    { name: 'key', type: 'string', unique: true },
                    { name: 'value', type: 'json' },
                    { name: 'group', type: 'string' },
                    { name: 'description', type: 'string' },
                    { name: 'isPublic', type: 'boolean' },
                    { name: 'createdAt', type: 'datetime' },
                    { name: 'updatedAt', type: 'datetime' }
                ],
                relationships: []
            }
        };

        // Define data category groups for UI organization
        this.dataCategories = [
            {
                id: 'crm',
                name: 'Customer Management',
                description: 'Customer and company related data',
                tables: ['users', 'companies', 'departments', 'addresses', 'roles'],
                color: '#2196f3',
                icon: 'Person'
            },
            {
                id: 'ecommerce',
                name: 'E-Commerce',
                description: 'Products, orders and inventory',
                tables: ['products', 'categories', 'brands', 'productImages', 'orders', 'orderItems', 'reviews', 'reviewImages', 'inventoryItems', 'warehouses'],
                color: '#4caf50',
                icon: 'ShoppingCart'
            },
            {
                id: 'analytics',
                name: 'Analytics',
                description: 'Site usage and user activity',
                tables: ['analytics', 'userActivities'],
                color: '#ff9800',
                icon: 'BarChart'
            },
            {
                id: 'support',
                name: 'Customer Support',
                description: 'Tickets and support requests',
                tables: ['tickets', 'ticketComments', 'ticketAttachments'],
                color: '#f44336',
                icon: 'Headset'
            },
            {
                id: 'system',
                name: 'System',
                description: 'Application settings and configuration',
                tables: ['settings'],
                color: '#9c27b0',
                icon: 'Settings'
            }
        ];
    }

    // Initialize the mock database
    init() {
        if (this.initialized) return;

        // Initialize the data for each table in the database
        Object.keys(this.schemas).forEach(tableName => {
            this.initializeTable(tableName);
        });

        this.initialized = true;
    }

    // Initialize a specific table with mock data
    initializeTable(tableName) {
        const storageKey = `mock_db_${tableName}`;
        if (localStorage.getItem(storageKey)) {
            return; // Data already exists
        }

        let mockData = [];
        const count = this.getTableCount(tableName);

        switch (tableName) {
            case 'roles':
                mockData = this.generateRoles();
                break;
            case 'addresses':
                mockData = this.generateAddresses(count);
                break;
            case 'companies':
                mockData = this.generateCompanies(count);
                break;
            case 'departments':
                mockData = this.generateDepartments(count);
                break;
            case 'users':
                mockData = this.generateUsers(count);
                break;
            case 'brands':
                mockData = this.generateBrands(count);
                break;
            case 'categories':
                mockData = this.generateCategories(count);
                break;
            case 'products':
                mockData = this.generateProducts(count);
                break;
            case 'productImages':
                mockData = this.generateProductImages(count);
                break;
            case 'warehouses':
                mockData = this.generateWarehouses(count);
                break;
            case 'inventoryItems':
                mockData = this.generateInventoryItems(count);
                break;
            case 'orders':
                mockData = this.generateOrders(count);
                break;
            case 'orderItems':
                mockData = this.generateOrderItems(count);
                break;
            case 'reviews':
                mockData = this.generateReviews(count);
                break;
            case 'reviewImages':
                mockData = this.generateReviewImages(count);
                break;
            case 'analytics':
                mockData = this.generateAnalytics(count);
                break;
            case 'userActivities':
                mockData = this.generateUserActivities(count);
                break;
            case 'tickets':
                mockData = this.generateTickets(count);
                break;
            case 'ticketComments':
                mockData = this.generateTicketComments(count);
                break;
            case 'ticketAttachments':
                mockData = this.generateTicketAttachments(count);
                break;
            case 'settings':
                mockData = this.generateSettings();
                break;
            default:
                mockData = [];
        }

        localStorage.setItem(storageKey, JSON.stringify(mockData));
    }

    // Helper function to determine how many records to generate for a table
    getTableCount(tableName) {
        const counts = {
            roles: 5,
            addresses: 200,
            companies: 50,
            departments: 100,
            users: 150,
            brands: 30,
            categories: 40,
            products: 300,
            productImages: 900,
            warehouses: 10,
            inventoryItems: 450,
            orders: 500,
            orderItems: 1500,
            reviews: 800,
            reviewImages: 400,
            analytics: 90,
            userActivities: 2000,
            tickets: 120,
            ticketComments: 350,
            ticketAttachments: 200,
            settings: 15
        };

        return counts[tableName] || 100;
    }

    // Data generation methods
    generateRoles() {
        return [
            {
                id: 1,
                name: 'admin',
                description: 'System administrator with full access',
                permissions: JSON.stringify({
                    users: ['view', 'create', 'update', 'delete'],
                    orders: ['view', 'create', 'update', 'delete'],
                    products: ['view', 'create', 'update', 'delete'],
                    settings: ['view', 'update']
                }),
                createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 2,
                name: 'manager',
                description: 'Manages team and product catalog',
                permissions: JSON.stringify({
                    users: ['view'],
                    products: ['view', 'create', 'update'],
                    orders: ['view', 'update']
                }),
                createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 3,
                name: 'support',
                description: 'Handles customer support tickets',
                permissions: JSON.stringify({
                    tickets: ['view', 'update', 'comment'],
                    users: ['view'],
                    orders: ['view']
                }),
                createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 4,
                name: 'viewer',
                description: 'Read-only access to most data',
                permissions: JSON.stringify({
                    users: ['view'],
                    products: ['view'],
                    orders: ['view'],
                    reviews: ['view']
                }),
                createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 5,
                name: 'guest',
                description: 'Limited access for demonstration',
                permissions: JSON.stringify({
                    products: ['view']
                }),
                createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];
    }
}



const mockDb = new MockDatabase();
mockDb.init();
export default mockDb;