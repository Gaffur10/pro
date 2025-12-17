from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np


app = Flask(__name__)
CORS(app)

# ===============================
# NORMALISASI MINMAX MANUAL
# ===============================
def minmax_scale(data):
    # Konversi ke numpy array jika belum
    data_np = np.array(data, dtype=float)
    if data_np.ndim == 1: # Handle jika data hanya satu dimensi
        data_np = data_np.reshape(-1, 1)
    
    min_val = data_np.min(axis=0)
    max_val = data_np.max(axis=0)
    
    # Tambahkan epsilon untuk menghindari pembagian dengan nol
    denominator = max_val - min_val
    denominator[denominator == 0] = 1e-9
    
    scaled = (data_np - min_val) / denominator
    return scaled, min_val.tolist(), max_val.tolist()


# ===============================
# HITUNG JARAK EUCLIDEAN
# ===============================
def euclidean(p1, p2):
    return np.sqrt(np.sum((np.array(p1) - np.array(p2)) ** 2))


# ===============================
# K-MEANS MANUAL
# ===============================
# Diperbarui untuk mengembalikan jarak setiap titik ke centroidnya
def kmeans_manual(data_scaled, k, max_iter=300):
    n_samples = len(data_scaled)
    
    # Handle jika k lebih besar dari jumlah sampel
    if k > n_samples:
        # Mengembalikan nilai default atau error, sesuai kebutuhan aplikasi
        # Di sini kita kembalikan array kosong sebagai indikasi
        return [], [], 0, []

    # Inisialisasi centroid acak
    # Pastikan sampel unik jika memungkinkan
    idx = np.arange(k)
    centroids = data_scaled[idx]

    clusters = np.zeros(n_samples, dtype=int)

    for _ in range(max_iter):
        # Assign cluster
        for i, point in enumerate(data_scaled):
            distances = [euclidean(point, centroid) for centroid in centroids]
            clusters[i] = np.argmin(distances)

        # Update centroid
        new_centroids = np.array([data_scaled[clusters == i].mean(axis=0) for i in range(k)])
        
        # Cek konvergensi
        if np.allclose(centroids, new_centroids):
            break
            
        centroids = new_centroids

    # Hitung WCSS dan jarak individual
    wcss = 0
    point_distances = []
    for i, point in enumerate(data_scaled):
        dist_to_centroid = euclidean(point, centroids[clusters[i]])
        wcss += dist_to_centroid ** 2
        point_distances.append(dist_to_centroid)

    return clusters.tolist(), centroids.tolist(), wcss, point_distances


# ===============================
# ENDPOINT: CLUSTERING (SEBELUMNYA /kmeans)
# ===============================
@app.route('/clustering', methods=['POST'])
def process_clustering():
    try:
        body = request.json

        # Disesuaikan dengan request dari Node.js
        data_with_ids = body['data']
        k = int(body['n_clusters'])

        # Ekstrak vektor dan ID
        ids = [item['id'] for item in data_with_ids]
        vectors = [item['vector'] for item in data_with_ids]

        if not vectors:
            return jsonify({"error": "Data vektor tidak boleh kosong"}), 400

        # Normalisasi
        data_scaled, min_val, max_val = minmax_scale(vectors)

        # Proses k-means manual
        labels, centroids, wcss, distances = kmeans_manual(data_scaled, k)

        # Format hasil sesuai yang diharapkan Node.js
        results = []
        for i in range(len(ids)):
            results.append({
                "id": ids[i],
                "cluster": labels[i],
                "distance": distances[i]
            })

        return jsonify({
            "results": results,
            "centroids": centroids,
            "wcss": wcss,
            "min_val": min_val,
            "max_val": max_val,
            "message": "K-Means manual berhasil dijalankan"
        })

    except Exception as e:
        print(f"ERROR /clustering: {e}")
        return jsonify({"error": f"Terjadi kesalahan pada server: {e}"}), 500


# ===============================
# ENDPOINT: ELBOW METHOD
# ===============================
@app.route('/elbow', methods=['POST'])
def process_elbow():
    try:
        body = request.json
        
        # Disesuaikan dengan request dari Node.js
        data_with_vectors = body['data']
        max_k = int(body.get('max_k', 10)) # Ambil max_k, default 10

        vectors = [item['vector'] for item in data_with_vectors]

        if not vectors:
            return jsonify({"error": "Data vektor tidak boleh kosong"}), 400

        # Normalisasi sekali saja
        data_scaled, _, _ = minmax_scale(vectors)

        results = []
        # Gunakan max_k dari request
        for k in range(1, max_k + 1):
            # Pastikan jumlah cluster tidak melebihi jumlah data
            if k > len(data_scaled):
                break
            
            _, _, wcss, _ = kmeans_manual(data_scaled, k)
            results.append({
                "k": k,
                "wcss": float(wcss)
            })

        return jsonify(results)

    except Exception as e:
        print(f"ERROR /elbow: {e}")
        return jsonify({"error": f"Terjadi kesalahan pada server: {e}"}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5001)