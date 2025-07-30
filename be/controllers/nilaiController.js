import { Op } from 'sequelize';
import nilai_Siswa from '../model/nilai_siswa.js';
import Siswa from '../model/siswaModel.js';

export const getAllNilai = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', semester = '' } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (search) {
      whereClause['$siswa.nama$'] = { [Op.like]: `%${search}%` };
    }
    if (semester) {
      whereClause.semester = semester;
    }

    const { count, rows } = await nilai_Siswa.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Siswa,
          as: 'siswa',
          attributes: ['id', 'nis', 'nama', 'kelas']
        }
      ],
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
    console.error('Get all nilai error:', error);
    console.error(error.stack);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message
    });
  }
};

export const getNilaiById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const nilai = await nilai_Siswa.findByPk(id, {
      include: [
        {
          model: Siswa,
          as: 'siswa',
          attributes: ['id', 'nis', 'nama', 'kelas', 'jenis_kelamin']
        }
      ]
    });

    if (!nilai) {
      return res.status(404).json({
        success: false,
        message: 'Data nilai tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: nilai
    });
  } catch (error) {
    console.error('Get nilai by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

export const createNilai = async (req, res) => {
  try {
    const {
      siswa_id,
      semester,
      Matematika,
      PKN,
      Seni_Budaya,
      ipa,
      Bahasa_Indonesia,
      Bahasa_Inggris,
      PJOK,
      IPS,
      Pend_Agama,
      TIK
    } = req.body;

    if (!siswa_id || !semester) {
      return res.status(400).json({
        success: false,
        message: 'ID siswa dan semester harus diisi'
      });
    }

    // Check if siswa exists
    const siswa = await Siswa.findByPk(siswa_id);
    if (!siswa) {
      return res.status(404).json({
        success: false,
        message: 'Siswa tidak ditemukan'
      });
    }

    // Check if nilai already exists for this siswa and semester
    const existingNilai = await nilai_Siswa.findOne({
      where: { siswa_id, semester }
    });
    if (existingNilai) {
      return res.status(400).json({
        success: false,
        message: 'Data nilai untuk siswa dan semester ini sudah ada'
      });
    }

    // Calculate average
    const nilaiArray = [
      Matematika,
      PKN,
      Seni_Budaya,
      ipa,
      Bahasa_Indonesia,
      Bahasa_Inggris,
      PJOK,
      IPS,
      Pend_Agama,
      TIK
    ].filter(nilai => nilai !== null && nilai !== undefined && nilai !== '');

    const rata_rata = nilaiArray.length > 0 
      ? (nilaiArray.reduce((sum, nilai) => sum + parseFloat(nilai), 0) / nilaiArray.length).toFixed(2)
      : 0;

    const nilai = await nilai_Siswa.create({
      siswa_id,
      semester,
      Matematika: Matematika || null,
      PKN: PKN || null,
      Seni_Budaya: Seni_Budaya || null,
      ipa: ipa || null,
      Bahasa_Indonesia: Bahasa_Indonesia || null,
      Bahasa_Inggris: Bahasa_Inggris || null,
      PJOK: PJOK || null,
      IPS: IPS || null,
      Pend_Agama: Pend_Agama || null,
      TIK: TIK || null,
      rata_rata
    });

    res.status(201).json({
      success: true,
      message: 'Data nilai berhasil ditambahkan',
      data: nilai
    });
  } catch (error) {
    console.error('Create nilai error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

export const updateNilai = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      semester,
      Matematika,
      PKN,
      Seni_Budaya,
      ipa,
      Bahasa_Indonesia,
      Bahasa_Inggris,
      PJOK,
      IPS,
      Pend_Agama,
      TIK
    } = req.body;

    const nilai = await nilai_Siswa.findByPk(id);
    if (!nilai) {
      return res.status(404).json({
        success: false,
        message: 'Data nilai tidak ditemukan'
      });
    }

    // Calculate new average
    const nilaiArray = [
      Matematika,
      PKN,
      Seni_Budaya,
      ipa,
      Bahasa_Indonesia,
      Bahasa_Inggris,
      PJOK,
      IPS,
      Pend_Agama,
      TIK
    ].filter(n => n !== null && n !== undefined && n !== '');

    const rata_rata = nilaiArray.length > 0 
      ? (nilaiArray.reduce((sum, n) => sum + parseFloat(n), 0) / nilaiArray.length).toFixed(2)
      : 0;

    await nilai.update({
      semester: semester || nilai.semester,
      Matematika: Matematika !== undefined ? Matematika : nilai.Matematika,
      PKN: PKN !== undefined ? PKN : nilai.PKN,
      Seni_Budaya: Seni_Budaya !== undefined ? Seni_Budaya : nilai.Seni_Budaya,
      ipa: ipa !== undefined ? ipa : nilai.ipa,
      Bahasa_Indonesia: Bahasa_Indonesia !== undefined ? Bahasa_Indonesia : nilai.Bahasa_Indonesia,
      Bahasa_Inggris: Bahasa_Inggris !== undefined ? Bahasa_Inggris : nilai.Bahasa_Inggris,
      PJOK: PJOK !== undefined ? PJOK : nilai.PJOK,
      IPS: IPS !== undefined ? IPS : nilai.IPS,
      Pend_Agama: Pend_Agama !== undefined ? Pend_Agama : nilai.Pend_Agama,
      TIK: TIK !== undefined ? TIK : nilai.TIK,
      rata_rata
    });

    res.json({
      success: true,
      message: 'Data nilai berhasil diperbarui',
      data: nilai
    });
  } catch (error) {
    console.error('Update nilai error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

export const deleteNilai = async (req, res) => {
  try {
    const { id } = req.params;
    
    const nilai = await nilai_Siswa.findByPk(id);
    if (!nilai) {
      return res.status(404).json({
        success: false,
        message: 'Data nilai tidak ditemukan'
      });
    }

    await nilai.destroy();

    res.json({
      success: true,
      message: 'Data nilai berhasil dihapus'
    });
  } catch (error) {
    console.error('Delete nilai error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

export const getNilaiStats = async (req, res) => {
  try {
    const totalNilai = await nilai_Siswa.count();
    
    const avgRataRata = await nilai_Siswa.findOne({
      attributes: [
        [nilai_Siswa.sequelize.fn('AVG', nilai_Siswa.sequelize.col('rata_rata')), 'rata_rata_keseluruhan']
      ]
    });

    const nilaiBySemester = await nilai_Siswa.findAll({
      attributes: [
        'semester',
        [nilai_Siswa.sequelize.fn('COUNT', '*'), 'jumlah'],
        [nilai_Siswa.sequelize.fn('AVG', nilai_Siswa.sequelize.col('rata_rata')), 'rata_rata']
      ],
      group: ['semester']
    });

    const nilaiByKelas = await nilai_Siswa.findAll({
      include: [
        {
          model: Siswa,
          as: 'siswa',
          attributes: ['kelas']
        }
      ],
      attributes: [
        [nilai_Siswa.sequelize.fn('AVG', nilai_Siswa.sequelize.col('rata_rata')), 'rata_rata'],
        [nilai_Siswa.sequelize.fn('COUNT', '*'), 'jumlah']
      ],
      group: ['siswa.kelas']
    });

    res.json({
      success: true,
      data: {
        total_nilai: totalNilai,
        rata_rata_keseluruhan: parseFloat(avgRataRata.dataValues.rata_rata_keseluruhan || 0).toFixed(2),
        by_semester: nilaiBySemester,
        by_kelas: nilaiByKelas
      }
    });
  } catch (error) {
    console.error('Get nilai stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};
