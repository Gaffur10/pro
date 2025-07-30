'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Rename old columns to new names or remove if not needed
    // Add new columns as per the updated model

    // Example: remove old columns that do not exist in new model
    await queryInterface.removeColumn('nilai_siswa', 'PKN').catch(() => {});
    await queryInterface.removeColumn('nilai_siswa', 'Seni_Budaya').catch(() => {});
    await queryInterface.removeColumn('nilai_siswa', 'ipa').catch(() => {});
    await queryInterface.removeColumn('nilai_siswa', 'PJOK').catch(() => {});
    await queryInterface.removeColumn('nilai_siswa', 'IPS').catch(() => {});
    await queryInterface.removeColumn('nilai_siswa', 'Pend_Agama').catch(() => {});
    await queryInterface.removeColumn('nilai_siswa', 'TIK').catch(() => {});

    // Add new columns if they do not exist
    await queryInterface.addColumn('nilai_siswa', 'PKN', {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: true,
    }).catch(() => {});

    await queryInterface.addColumn('nilai_siswa', 'Seni_Budaya', {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: true,
    }).catch(() => {});

    await queryInterface.addColumn('nilai_siswa', 'IPA', {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: true,
    }).catch(() => {});

    await queryInterface.addColumn('nilai_siswa', 'PJOK', {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: true,
    }).catch(() => {});

    await queryInterface.addColumn('nilai_siswa', 'IPS', {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: true,
    }).catch(() => {});

    await queryInterface.addColumn('nilai_siswa', 'Pend_Agama', {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: true,
    }).catch(() => {});

    await queryInterface.addColumn('nilai_siswa', 'TIK', {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: true,
    }).catch(() => {});
  },

  down: async (queryInterface, Sequelize) => {
    // Revert changes: add back old columns, remove new columns

    await queryInterface.addColumn('nilai_siswa', 'PKN', {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: true,
    }).catch(() => {});

    await queryInterface.addColumn('nilai_siswa', 'Seni_Budaya', {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: true,
    }).catch(() => {});

    await queryInterface.addColumn('nilai_siswa', 'ipa', {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: true,
    }).catch(() => {});

    await queryInterface.addColumn('nilai_siswa', 'PJOK', {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: true,
    }).catch(() => {});

    await queryInterface.addColumn('nilai_siswa', 'IPS', {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: true,
    }).catch(() => {});

    await queryInterface.addColumn('nilai_siswa', 'Pend_Agama', {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: true,
    }).catch(() => {});

    await queryInterface.addColumn('nilai_siswa', 'TIK', {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: true,
    }).catch(() => {});

    await queryInterface.removeColumn('nilai_siswa', 'PKN').catch(() => {});
    await queryInterface.removeColumn('nilai_siswa', 'Seni_Budaya').catch(() => {});
    await queryInterface.removeColumn('nilai_siswa', 'IPA').catch(() => {});
    await queryInterface.removeColumn('nilai_siswa', 'PJOK').catch(() => {});
    await queryInterface.removeColumn('nilai_siswa', 'IPS').catch(() => {});
    await queryInterface.removeColumn('nilai_siswa', 'Pend_Agama').catch(() => {});
    await queryInterface.removeColumn('nilai_siswa', 'TIK').catch(() => {});
  }
};
