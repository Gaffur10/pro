'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('nilai_siswa');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('nilai_siswa', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      siswa_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'siswa',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      semester: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      Matematika: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      PKN: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      Seni_Budaya: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      ipa: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      Bahasa_Indonesia: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      Bahasa_Inggris: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      PJOK: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      IPS: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      Pend_Agama: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      TIK: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      rata_rata: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      }
    });
  }
};