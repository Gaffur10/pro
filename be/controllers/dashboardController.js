import Siswa from '../model/siswaModel.js';
import nilai_Siswa from '../model/nilai_siswa.js';
import hasil_cluster from '../model/hasil.js';
import User from '../model/userModel.js';

export const getDashboardStats = async (req, res) => {
  try {
    // Get basic counts
    const totalSiswa = await Siswa.count();
    const totalNilai = await nilai_Siswa.count();
    const totalUsers = await User.count();
    const totalClustering = await hasil_cluster.count();

    // Get nilai statistics
    const avgRataRata = await nilai_Siswa.findOne({
      attributes: [
        [nilai_Siswa.sequelize.fn('AVG', nilai_Siswa.sequelize.col('rata_rata')), 'rata_rata_keseluruhan']
      ]
    });

    const siswaBerprestasi = await nilai_Siswa.count({
      where: {
        rata_rata: {
          [nilai_Siswa.sequelize.Op.gte]: 80
        }
      }
    });

    const perluPerhatian = await nilai_Siswa.count({
      where: {
        rata_rata: {
          [nilai_Siswa.sequelize.Op.lt]: 60
        }
      }
    });

    // Get clustering statistics
    const clusterStats = await hasil_cluster.findAll({
      attributes: [
        'keterangan',
        [hasil_cluster.sequelize.fn('COUNT', '*'), 'jumlah']
      ],
      group: ['keterangan']
    });

    const clusterDistribution = {};
    clusterStats.forEach(stat => {
      const label = stat.dataValues.keterangan.toLowerCase();
      clusterDistribution[label] = {
        count: parseInt(stat.dataValues.jumlah),
        percentage: ((parseInt(stat.dataValues.jumlah) / totalClustering) * 100).toFixed(1)
      };
    });

    // Get recent activities (simulated)
    const recentActivities = [
      {
        id: 1,
        action: "Data nilai siswa diperbarui",
        user: "Admin",
        time: "2 menit yang lalu"
      },
      {
        id: 2,
        action: "Clustering baru dibuat",
        user: "Admin", 
        time: "1 jam yang lalu"
      },
      {
        id: 3,
        action: "Siswa baru ditambahkan",
        user: "Admin",
        time: "3 jam yang lalu"
      },
      {
        id: 4,
        action: "Laporan clustering diunduh",
        user: "Admin",
        time: "1 hari yang lalu"
      }
    ];

    // Calculate changes (simulated for now)
    const changes = {
      siswa: "+15",
      nilai: "+89",
      clustering: "0",
      users: "+2"
    };

    res.json({
      success: true,
      data: {
        stats: {
          total_siswa: totalSiswa,
          total_nilai: totalNilai,
          total_users: totalUsers,
          total_clustering: totalClustering,
          rata_rata_nilai: parseFloat(avgRataRata.dataValues.rata_rata_keseluruhan || 0).toFixed(1),
          siswa_berprestasi: siswaBerprestasi,
          perlu_perhatian: perluPerhatian
        },
        changes,
        cluster_distribution: clusterDistribution,
        recent_activities: recentActivities
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

export const getChartData = async (req, res) => {
  try {
    // Get nilai distribution by range
    const nilaiRanges = [
      { min: 0, max: 59, label: '0-59' },
      { min: 60, max: 69, label: '60-69' },
      { min: 70, max: 79, label: '70-79' },
      { min: 80, max: 89, label: '80-89' },
      { min: 90, max: 100, label: '90-100' }
    ];

    const nilaiDistribution = [];
    for (const range of nilaiRanges) {
      const count = await nilai_Siswa.count({
        where: {
          rata_rata: {
            [nilai_Siswa.sequelize.Op.between]: [range.min, range.max]
          }
        }
      });
      nilaiDistribution.push({
        range: range.label,
        count: count
      });
    }

    // Get nilai by kelas
    const nilaiByKelas = await nilai_Siswa.findAll({
      include: [
        {
          model: Siswa,
          as: 'Siswa',
          attributes: ['kelas']
        }
      ],
      attributes: [
        [nilai_Siswa.sequelize.fn('AVG', nilai_Siswa.sequelize.col('rata_rata')), 'rata_rata'],
        [nilai_Siswa.sequelize.fn('COUNT', '*'), 'jumlah']
      ],
      group: ['Siswa.kelas']
    });

    // Get siswa by gender
    const siswaByGender = await Siswa.findAll({
      attributes: [
        'jenis_kelamin',
        [Siswa.sequelize.fn('COUNT', '*'), 'jumlah']
      ],
      group: ['jenis_kelamin']
    });

    // Get nilai trend by semester
    const nilaiBySemester = await nilai_Siswa.findAll({
      attributes: [
        'semester',
        [nilai_Siswa.sequelize.fn('AVG', nilai_Siswa.sequelize.col('rata_rata')), 'rata_rata'],
        [nilai_Siswa.sequelize.fn('COUNT', '*'), 'jumlah']
      ],
      group: ['semester']
    });

    res.json({
      success: true,
      data: {
        nilai_distribution: nilaiDistribution,
        nilai_by_kelas: nilaiByKelas,
        siswa_by_gender: siswaByGender,
        nilai_by_semester: nilaiBySemester
      }
    });
  } catch (error) {
    console.error('Get chart data error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

export const getQuickStats = async (req, res) => {
  try {
    // Get today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const siswaHariIni = await Siswa.count({
      where: {
        created_at: {
          [Siswa.sequelize.Op.gte]: today
        }
      }
    });

    const nilaiHariIni = await nilai_Siswa.count({
      where: {
        created_at: {
          [nilai_Siswa.sequelize.Op.gte]: today
        }
      }
    });

    const clusteringHariIni = await hasil_cluster.count({
      where: {
        created_at: {
          [hasil_cluster.sequelize.Op.gte]: today
        }
      }
    });

    // Get top performing students
    const topStudents = await nilai_Siswa.findAll({
      include: [
        {
          model: Siswa,
          as: 'Siswa',
          attributes: ['nama', 'nis', 'kelas']
        }
      ],
      attributes: ['rata_rata'],
      order: [['rata_rata', 'DESC']],
      limit: 5
    });

    // Get recent nilai entries
    const recentNilai = await nilai_Siswa.findAll({
      include: [
        {
          model: Siswa,
          as: 'Siswa',
          attributes: ['nama', 'nis', 'kelas']
        }
      ],
      attributes: ['rata_rata', 'semester', 'created_at'],
      order: [['created_at', 'DESC']],
      limit: 10
    });

    res.json({
      success: true,
      data: {
        today_stats: {
          siswa_baru: siswaHariIni,
          nilai_baru: nilaiHariIni,
          clustering_baru: clusteringHariIni
        },
        top_students: topStudents,
        recent_nilai: recentNilai
      }
    });
  } catch (error) {
    console.error('Get quick stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
}; 