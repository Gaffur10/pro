import { Op } from 'sequelize';
import Siswa from '../model/siswaModel.js';

export const getAllSiswa = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = search ? {
      [Op.or]: [
        { nama: { [Op.like]: `%${search}%` } },
        { nis: { [Op.like]: `%${search}%` } },
        { kelas: { [Op.like]: `%${search}%` } }
      ]
    } : {};

    const { count, rows } = await Siswa.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / limit),
        total_items: count,
        items_per_page: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get all siswa error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

export const getSiswaById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const siswa = await Siswa.findByPk(id);
    if (!siswa) {
      return res.status(404).json({
        success: false,
        message: 'Siswa tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: siswa
    });
  } catch (error) {
    console.error('Get siswa by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

export const createSiswa = async (req, res) => {
  try {
    const { nis, nama, kelas, jenis_kelamin, tanggal_lahir, alamat, telepon } = req.body;

    if (!nis || !nama || !kelas || !jenis_kelamin || !tanggal_lahir || !alamat || !telepon) {
      return res.status(400).json({
        success: false,
        message: 'Semua field harus diisi'
      });
    }

    // Check if NIS already exists
    const existingSiswa = await Siswa.findOne({ where: { nis } });
    if (existingSiswa) {
      return res.status(400).json({
        success: false,
        message: 'NIS sudah terdaftar'
      });
    }

    const siswa = await Siswa.create({
      nis,
      nama,
      kelas,
      jenis_kelamin,
      tanggal_lahir,
      alamat,
      telepon
    });

    res.status(201).json({
      success: true,
      message: 'Siswa berhasil ditambahkan',
      data: siswa
    });
  } catch (error) {
    console.error('Create siswa error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

export const updateSiswa = async (req, res) => {
  try {
    const { id } = req.params;
    const { nis, nama, kelas, jenis_kelamin, tanggal_lahir, alamat, telepon } = req.body;

    const siswa = await Siswa.findByPk(id);
    if (!siswa) {
      return res.status(404).json({
        success: false,
        message: 'Siswa tidak ditemukan'
      });
    }

    // Check if NIS already exists (excluding current siswa)
    if (nis && nis !== siswa.nis) {
      const existingSiswa = await Siswa.findOne({ where: { nis } });
      if (existingSiswa) {
        return res.status(400).json({
          success: false,
          message: 'NIS sudah terdaftar'
        });
      }
    }

    await siswa.update({
      nis: nis || siswa.nis,
      nama: nama || siswa.nama,
      kelas: kelas || siswa.kelas,
      jenis_kelamin: jenis_kelamin || siswa.jenis_kelamin,
      tanggal_lahir: tanggal_lahir || siswa.tanggal_lahir,
      alamat: alamat || siswa.alamat,
      telepon: telepon || siswa.telepon
    });

    res.json({
      success: true,
      message: 'Siswa berhasil diperbarui',
      data: siswa
    });
  } catch (error) {
    console.error('Update siswa error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

export const deleteSiswa = async (req, res) => {
  try {
    const { id } = req.params;
    
    const siswa = await Siswa.findByPk(id);
    if (!siswa) {
      return res.status(404).json({
        success: false,
        message: 'Siswa tidak ditemukan'
      });
    }

    await siswa.destroy();

    res.json({
      success: true,
      message: 'Siswa berhasil dihapus'
    });
  } catch (error) {
    console.error('Delete siswa error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

export const getSiswaStats = async (req, res) => {
  try {
    const totalSiswa = await Siswa.count();
    
    const siswaByKelas = await Siswa.findAll({
      attributes: [
        'kelas',
        [Siswa.sequelize.fn('COUNT', '*'), 'jumlah']
      ],
      group: ['kelas']
    });

    const siswaByGender = await Siswa.findAll({
      attributes: [
        'jenis_kelamin',
        [Siswa.sequelize.fn('COUNT', '*'), 'jumlah']
      ],
      group: ['jenis_kelamin']
    });

    res.json({
      success: true,
      data: {
        total_siswa: totalSiswa,
        by_kelas: siswaByKelas,
        by_gender: siswaByGender
      }
    });
  } catch (error) {
    console.error('Get siswa stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
}; 