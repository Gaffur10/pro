# Import library yang diperlukan
from flask import Flask, request, jsonify  # Flask untuk membuat server web
from flask_cors import CORS               # Untuk mengizinkan request dari domain lain (frontend)
import random
import math

# Inisialisasi aplikasi Flask
app = Flask(__name__)
# Aktifkan CORS untuk semua rute, agar frontend bisa mengakses API ini
CORS(app)

# === IMPLEMENTASI K-MEANS DARI AWAL ===
def hitung_jarak_euclidean(titik1, titik2):
    """Fungsi bantuan untuk menghitung jarak antara dua titik."""
    total_jarak_kuadrat = 0
    for i in range(len(titik1)):
        total_jarak_kuadrat += (titik1[i] - titik2[i]) ** 2
    return math.sqrt(total_jarak_kuadrat)

def hitung_wcss(data, labels, centroids):
    """Menghitung Within-Cluster Sum of Squares (WCSS)."""
    wcss = 0
    for i, titik_data in enumerate(data):
        # Dapatkan centroid yang ditetapkan untuk titik data saat ini
        centroid_assigned = centroids[labels[i]]
        # Tambahkan kuadrat jarak dari titik ke centroidnya
        wcss += hitung_jarak_euclidean(titik_data, centroid_assigned) ** 2
    return wcss

def jalankan_kmeans(data, k, max_iterasi=100):
    """
    Implementasi sederhana algoritma K-Means dari awal untuk tujuan demonstrasi.
    """
    if not data or len(data) < k:
        return [], []

    # Tetapkan random seed untuk hasil yang konsisten
    random.seed(0)

    # === LANGKAH 1: Inisialisasi Centroid ===
    centroids = [list(c) for c in random.sample(data, k)]

    for i in range(max_iterasi):
        clusters = [[] for _ in range(k)]
        labels = []

        # === LANGKAH 2: Penugasan Cluster (Assignment) ===
        for titik_data_siswa in data:
            jarak_ke_centroids = [hitung_jarak_euclidean(titik_data_siswa, c) for c in centroids]
            indeks_cluster_terdekat = jarak_ke_centroids.index(min(jarak_ke_centroids))
            clusters[indeks_cluster_terdekat].append(titik_data_siswa)
            labels.append(indeks_cluster_terdekat)
        
        centroids_lama = centroids[:]

        # === LANGKAH 3: Pembaruan Centroid (Update) ===
        for indeks_cluster in range(k):
            if clusters[indeks_cluster]:
                centroid_baru = [sum(dimensi) / len(dimensi) for dimensi in zip(*clusters[indeks_cluster])]
                centroids[indeks_cluster] = centroid_baru
        
        # === LANGKAH 4: Periksa Konvergensi ===
        apakah_konvergen = True
        for idx in range(k):
            if hitung_jarak_euclidean(centroids_lama[idx], centroids[idx]) > 0.0001:
                apakah_konvergen = False
                break
        
        if apakah_konvergen:
            break

    return labels, centroids
# === AKHIR DARI IMPLEMENTASI K-MEANS ===


# Definisikan endpoint untuk clustering, hanya menerima metode POST
@app.route('/clustering', methods=['POST'])
def clustering():
    """
    Endpoint ini menerima data nilai siswa, menjalankan algoritma K-Means,
    dan mengembalikan hasil pengelompokan beserta jarak ke centroid.
    """
    try:
        data = request.get_json()
        
        if not data or 'data' not in data or 'n_clusters' not in data:
            return jsonify({'error': 'Request tidak valid. Key `data` atau `n_clusters` tidak ditemukan'}), 400

        n_clusters = data.get('n_clusters', 5)
        items = data.get('data', [])

        if not items:
            return jsonify({'error': 'List data kosong'}), 400

        ids = [item['id'] for item in items]
        vectors = [item['vector'] for item in items]

        if len(vectors) < n_clusters:
            return jsonify({'error': f'Jumlah data ({len(vectors)}) tidak boleh kurang dari jumlah cluster ({n_clusters})'}), 400

        # Jalankan K-Means dan dapatkan juga posisi centroid final
        cluster_labels, centroids = jalankan_kmeans(vectors, n_clusters)

        # Siapkan hasil dengan menyertakan jarak ke centroid
        result = []
        for i, vector in enumerate(vectors):
            label = cluster_labels[i]
            centroid = centroids[label]
            distance = hitung_jarak_euclidean(vector, centroid)
            result.append({
                'id': ids[i],
                'cluster': int(label),
                'distance': distance
            })

        return jsonify(result)

    except Exception as e:
        print(f"Terjadi error di /clustering: {e}")
        return jsonify({'error': 'Terjadi kesalahan internal pada server'}), 500

# Definisikan endpoint untuk perhitungan Elbow Method
@app.route('/elbow', methods=['POST'])
def elbow_method():
    """
    Endpoint ini menjalankan K-Means untuk rentang K dan mengembalikan skor WCSS.
    """
    try:
        req_data = request.get_json()
        if not req_data or 'data' not in req_data:
            return jsonify({'error': 'Request tidak valid. Key `data` tidak ditemukan'}), 400

        vectors = [item['vector'] for item in req_data.get('data', [])]
        max_k = req_data.get('max_k', 10)

        if not vectors:
            return jsonify({'error': 'List data kosong'}), 400

        wcss_scores = []
        # Loop dari k=1 sampai max_k
        for k in range(1, max_k + 1):
            # Hentikan jika jumlah data lebih sedikit dari jumlah cluster
            if len(vectors) < k:
                break
            
            # Jalankan K-Means untuk nilai k saat ini
            labels, centroids = jalankan_kmeans(vectors, k)
            
            # Hitung WCSS dan simpan hasilnya
            wcss = hitung_wcss(vectors, labels, centroids)
            wcss_scores.append({'k': k, 'wcss': wcss})

        return jsonify(wcss_scores)

    except Exception as e:
        print(f"Terjadi error di /elbow: {e}")
        return jsonify({'error': 'Terjadi kesalahan internal pada server'}), 500


# Jalankan aplikasi jika file ini dieksekusi secara langsung
if __name__ == '__main__':
    # debug=True agar server otomatis restart saat ada perubahan kode
    # port=5001 agar tidak bentrok dengan port server lain (Node.js atau Next.js)
    app.run(debug=True, port=5001)