import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { upload } from "https://cdn.jsdelivr.net/npm/@imagekit/javascript@5.0.0/+esm";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


// ========================================
// FIREBASE CONFIG
// ========================================

const firebaseConfig = {
    apiKey: "AIzaSyDFKiy6M-X8iuoBjr5W9CArF3YTVBVIW2E",
    authDomain: "test-firebase-bad24.firebaseapp.com",
    projectId: "test-firebase-bad24",
    storageBucket: "test-firebase-bad24.firebasestorage.app",
    messagingSenderId: "471986352432",
    appId: "1:471986352432:web:8b5f42e3d5dc63d61ad8f5",
    measurementId: "G-J6K2K534E"
};


// ========================================
// HUBUNGKAN FIREBASE
// ========================================

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

console.log("Firebase berhasil terhubung!");
console.log("Firestore berhasil terhubung!");


// ========================================
// ELEMENT HTML
// ========================================

const btnTambah = document.getElementById("btnTambah");

const btnBatal = document.getElementById("btnBatal");

const btnSimpan = document.getElementById("btnSimpan");

const formService = document.getElementById("formService");

const dataContainer = document.getElementById("dataContainer");


// ========================================
// TOMBOL TAMBAH
// ========================================

btnTambah.addEventListener("click", () => {

    formService.classList.remove("hidden");

    btnTambah.style.display = "none";

});


// ========================================
// TOMBOL BATAL
// ========================================

btnBatal.addEventListener("click", () => {

    formService.classList.add("hidden");

    btnTambah.style.display = "inline-block";

    kosongkanForm();

});


// ========================================
// UPLOAD FOTO KE IMAGEKIT
// ========================================

async function uploadFoto(file) {

    // Kalau tidak memilih foto
    if (!file) {
        return null;
    }

    // Ambil authentication dari server
    const response = await fetch("/auth");

    if (!response.ok) {
        throw new Error(
            "Gagal mendapatkan authentication ImageKit"
        );
    }

    const auth = await response.json();

    // Upload ke ImageKit
    const result = await upload({

        file: file,

        fileName: file.name,

        token: auth.token,

        expire: auth.expire,

        signature: auth.signature,

        publicKey: "public_zK95UX97r49b3aPAYirOIoCXJPY=",

        useUniqueFileName: true

    });

    console.log("Foto berhasil diupload:", result);

    return result;
}


// ========================================
// SIMPAN DATA
// ========================================

btnSimpan.addEventListener("click", async () => {

    const nama =
        document.getElementById("nama").value.trim();

    const noHp =
        document.getElementById("noHp").value.trim();

    const keluhan =
        document.getElementById("keluhan").value.trim();

    const tanggal =
        document.getElementById("tanggal").value;

    // Ambil foto
    const inputFoto =
        document.getElementById("foto");

    const fileFoto =
        inputFoto ? inputFoto.files[0] : null;


    // ========================================
    // CEK DATA
    // ========================================

    if (
        nama === "" ||
        noHp === "" ||
        keluhan === "" ||
        tanggal === ""
    ) {

        alert("Semua data harus diisi!");

        return;

    }


    try {

        // ========================================
        // MATIKAN TOMBOL SEMENTARA
        // ========================================

        btnSimpan.disabled = true;

        btnSimpan.textContent = "Menyimpan...";


        // ========================================
        // UPLOAD FOTO
        // ========================================

        let fotoUrl = "";

        if (fileFoto) {

            btnSimpan.textContent =
                "Mengupload foto...";

            const fotoResult =
                await uploadFoto(fileFoto);

            if (fotoResult) {

                fotoUrl = fotoResult.url;

            }

        }


        // ========================================
        // SIMPAN KE FIRESTORE
        // ========================================

        btnSimpan.textContent =
            "Menyimpan data...";

        const docRef = await addDoc(

            collection(db, "services"),

            {
                namaPelanggan: nama,

                noHp: noHp,

                keluhan: keluhan,

                tanggalMasuk: tanggal,

                fotoUrl: fotoUrl
            }

        );


        console.log(
            "Data berhasil disimpan dengan ID:",
            docRef.id
        );


        alert(
            "Data service berhasil disimpan!"
        );


        // ========================================
        // KOSONGKAN FORM
        // ========================================

        kosongkanForm();


        // ========================================
        // TUTUP FORM
        // ========================================

        formService.classList.add("hidden");

        btnTambah.style.display = "inline-block";


        // ========================================
        // PERBARUI DATA
        // ========================================

        tampilkanData();


    } catch (error) {

        console.error(
            "ERROR:",
            error
        );

        alert(
            "Gagal menyimpan data. Cek Console."
        );

    } finally {

        // Kembalikan tombol
        btnSimpan.disabled = false;

        btnSimpan.textContent =
            "Simpan Data";

    }

});


// ========================================
// TAMPILKAN DATA
// ========================================

async function tampilkanData() {

    dataContainer.innerHTML = "";

    try {

        const querySnapshot =
            await getDocs(
                collection(db, "services")
            );


        if (querySnapshot.empty) {

            dataContainer.innerHTML = `

                <p class="empty">
                    Belum ada data service.
                </p>

            `;

            return;

        }


        querySnapshot.forEach((data) => {

            const service = data.data();

            const id = data.id;


            const div =
                document.createElement("div");

            div.className =
                "service-item";


            // ========================================
            // FOTO
            // ========================================

            let fotoHTML = "";

            if (service.fotoUrl) {

                fotoHTML = `

                    <img
                        src="${service.fotoUrl}"
                        class="foto-hp"
                        alt="Foto HP"
                    >

                `;

            }


            // ========================================
            // DATA SERVICE
            // ========================================

            div.innerHTML = `

                ${fotoHTML}

                <h3>
                    ${service.namaPelanggan}
                </h3>

                <p>
                    <strong>No HP:</strong>
                    ${service.noHp}
                </p>

                <p>
                    <strong>Keluhan:</strong>
                    ${service.keluhan}
                </p>

                <p>
                    <strong>Tanggal Masuk:</strong>
                    ${service.tanggalMasuk}
                </p>

                <button
                    class="btn-hapus"
                    data-id="${id}"
                >
                    Hapus
                </button>

            `;


            dataContainer.appendChild(div);

        });


        // ========================================
        // TOMBOL HAPUS
        // ========================================

        const tombolHapus =
            document.querySelectorAll(
                ".btn-hapus"
            );


        tombolHapus.forEach((button) => {

            button.addEventListener(
                "click",
                async () => {

                    const id =
                        button.dataset.id;


                    const konfirmasi =
                        confirm(
                            "Yakin ingin menghapus data ini?"
                        );


                    if (!konfirmasi) {

                        return;

                    }


                    try {

                        await deleteDoc(

                            doc(
                                db,
                                "services",
                                id
                            )

                        );


                        alert(
                            "Data berhasil dihapus!"
                        );


                        tampilkanData();


                    } catch (error) {

                        console.error(
                            "ERROR HAPUS:",
                            error
                        );

                        alert(
                            "Gagal menghapus data."
                        );

                    }

                }
            );

        });


    } catch (error) {

        console.error(
            "ERROR MENGAMBIL DATA:",
            error
        );


        dataContainer.innerHTML = `

            <p class="empty">
                Gagal mengambil data.
            </p>

        `;

    }

}


// ========================================
// KOSONGKAN FORM
// ========================================

function kosongkanForm() {

    document.getElementById("nama").value = "";

    document.getElementById("noHp").value = "";

    document.getElementById("keluhan").value = "";

    document.getElementById("tanggal").value = "";


    // Kosongkan foto
    const inputFoto =
        document.getElementById("foto");

    if (inputFoto) {

        inputFoto.value = "";

    }

}


// ========================================
// JALANKAN SAAT WEBSITE DIBUKA
// ========================================

tampilkanData();