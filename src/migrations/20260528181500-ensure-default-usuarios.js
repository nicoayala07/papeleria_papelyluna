'use strict';

const bcrypt = require('bcrypt');

const DEFAULT_USERS = [
  { username: 'admin', password: 'admin123', role: 'ADMIN' },
  { username: 'vendedor', password: 'vendedor123', role: 'USER' }
];

module.exports = {
  up: async (queryInterface) => {
    for (const user of DEFAULT_USERS) {
      const now = new Date();
      const password = await bcrypt.hash(user.password, 10);
      const existingId = await queryInterface.rawSelect(
        'Usuarios',
        { where: { username: user.username } },
        ['id']
      );

      if (existingId) {
        await queryInterface.bulkUpdate(
          'Usuarios',
          {
            password,
            role: user.role,
            updatedAt: now
          },
          { username: user.username }
        );
        continue;
      }

      await queryInterface.bulkInsert('Usuarios', [
        {
          username: user.username,
          password,
          role: user.role,
          createdAt: now,
          updatedAt: now
        }
      ]);
    }
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('Usuarios', {
      username: DEFAULT_USERS.map(user => user.username)
    });
  }
};
