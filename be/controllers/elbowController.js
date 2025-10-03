import Nilai from '../model/nilaiModel.js';
import Siswa from '../model/siswaModel.js';
import MataPelajaran from '../model/mapelModel.js';
import axios from 'axios'; // Tambahkan axios

export const getElbowAnalysis = async (req, res) => {
  try {
    const { semester = '', tahun_ajaran = '' } = req.query;

    const allMapel = await MataPelajaran.findAll({ order: [['id', 'ASC']] });
    const mapelOrder = allMapel.map(m => m.id);

    const whereClause = {};
    if (semester) whereClause.semester = semester;
    if (tahun_ajaran) whereClause.tahun_ajaran = tahun_ajaran;

    const nilaiData = await Nilai.findAll({
      where: whereClause,
      include: [
        { model: Siswa, as: 'siswa', attributes: ['id', 'nis', 'nama', 'kelas'] },
      ],
      order: [['siswa_id', 'ASC'], ['mapel_id', 'ASC']]
    });

    if (nilaiData.length === 0) {
      return res.status(400).json({ message: 'Tidak ada data nilai yang cocok dengan filter yang diberikan untuk analisis elbow' });
    }

    const pivotedData = nilaiData.reduce((acc, item) => {
      if (!item.siswa) return acc;
      const { siswa_id } = item;
      if (!acc[siswa_id]) {
        acc[siswa_id] = {
          siswa_id: item.siswa_id,
          nis: item.siswa.nis,
          nama: item.siswa.nama,
          kelas: item.siswa.kelas,
          semester: item.semester,
          tahun_ajaran: item.tahun_ajaran,
          nilai: {}
        };
      }
      acc[siswa_id].nilai[item.mapel_id] = parseFloat(item.nilai);
      return acc;
    }, {});

    const dataForKMeans = Object.values(pivotedData).map(siswa => {
      const vector = mapelOrder.map(mapelId => siswa.nilai[mapelId] || 0);
      return { ...siswa, vector };
    });

    const max_k = Math.min(10, dataForKMeans.length - 1);
    if (max_k < 1) {
        return res.status(400).json({ message: 'Data tidak cukup untuk analisis elbow.' });
    }

    // --- Panggil Layanan Elbow Method di Flask ---
    const flaskRequestData = {
        max_k: max_k,
        data: dataForKMeans.map(item => ({ vector: item.vector }))
    };

    const flaskResponse = await axios.post('http://localhost:5001/elbow', flaskRequestData);
    const elbowData = flaskResponse.data; // Hasilnya: [{k: 1, wcss: ...}, {k: 2, wcss: ...}]

    // --- Logika untuk menemukan titik siku (elbow point) tetap sama ---
    let optimalK = 1;
    if (elbowData.length > 2) {
      let maxDistance = 0;
      const firstPoint = { x: elbowData[0].k, y: elbowData[0].wcss };
      const lastPoint = { x: elbowData[elbowData.length - 1].k, y: elbowData[elbowData.length - 1].wcss };
      
      for (let i = 1; i < elbowData.length - 1; i++) {
        const point = { x: elbowData[i].k, y: elbowData[i].wcss };
        const distance = Math.abs(
          (lastPoint.y - firstPoint.y) * point.x - 
          (lastPoint.x - firstPoint.x) * point.y + 
          lastPoint.x * firstPoint.y - lastPoint.y * firstPoint.x
        ) / Math.sqrt(
          Math.pow(lastPoint.y - firstPoint.y, 2) + 
          Math.pow(lastPoint.x - firstPoint.x, 2)
        );
        
        if (distance > maxDistance) {
          maxDistance = distance;
          optimalK = elbowData[i].k;
        }
      }
    }

    const k_values = elbowData.map(d => d.k);
    const wcss_values = elbowData.map(d => d.wcss);

    res.json({
      success: true,
      data: {
        k_values,
        wcss_values,
        optimal_k: optimalK,
        elbow_point: optimalK, // Assuming elbow point is the same as optimal K
        recommendation: `Berdasarkan analisis elbow, jumlah cluster optimal adalah ${optimalK}`
      }
    });

  } catch (error) {
    console.error('Elbow analysis error:', error.message);
    console.error(error.stack);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Terjadi kesalahan server saat analisis elbow' 
    });
  }
};
