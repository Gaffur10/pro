'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('nilai_siswa', 'tahun_ajaran', {
      type: Sequelize.STRING(20),
      allowNull: false,
      after: 'semester'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('nilai_siswa', 'tahun_ajaran');
  }
};
