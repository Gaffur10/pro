'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('hasil_cluster', 'semester', {
      type: Sequelize.STRING(10),
      allowNull: true,
      after: 'keterangan'
    });
    
    await queryInterface.addColumn('hasil_cluster', 'tahun_ajaran', {
      type: Sequelize.STRING(20),
      allowNull: true,
      after: 'semester'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('hasil_cluster', 'semester');
    await queryInterface.removeColumn('hasil_cluster', 'tahun_ajaran');
  }
};
