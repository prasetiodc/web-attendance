'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // 1. Insert employees
    await queryInterface.bulkInsert('employees', [
      {
        id: 1,
        employeeCode: 'EMP001',
        fullName: 'Admin User',
        email: 'admin@dexagroup.com',
        phone: '081234567890',
        position: 'HR Administrator',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 2,
        employeeCode: 'EMP002',
        fullName: 'John Doe',
        email: 'john.doe@dexagroup.com',
        phone: '081298765432',
        position: 'Software Engineer',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 3,
        employeeCode: 'EMP003',
        fullName: 'Jane Smith',
        email: 'jane.smith@dexagroup.com',
        phone: '081245678901',
        position: 'Product Designer',
        createdAt: now,
        updatedAt: now,
      },
    ], {});

    // 2. Insert users associated with those employees
    await queryInterface.bulkInsert('users', [
      {
        id: 1,
        employeeId: 1,
        email: 'admin@dexagroup.com',
        password: bcrypt.hashSync('adminpassword', 10),
        role: 'admin',
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 2,
        employeeId: 2,
        email: 'john.doe@dexagroup.com',
        password: bcrypt.hashSync('userpassword', 10),
        role: 'employee',
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 3,
        employeeId: 3,
        email: 'jane.smith@dexagroup.com',
        password: bcrypt.hashSync('userpassword2', 10),
        role: 'employee',
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
    await queryInterface.bulkDelete('employees', null, {});
  },
};
