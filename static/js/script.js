// Fungsi untuk navigasi antar tab
function showTab(tabId) {
    const tabs = document.querySelectorAll('.content');
    const links = document.querySelectorAll('nav ul li a');
  
    tabs.forEach(tab => {
      tab.classList.remove('active');
    });
  
    links.forEach(link => {
      link.classList.remove('active');
    });
  
    document.getElementById(tabId).classList.add('active');
    document.querySelector(`nav ul li a[href="#${tabId}"]`).classList.add('active');
  }
  
  // Fungsi untuk proses "translate"
  function translateText() {
    const inputText = document.getElementById('inputText').value.trim();
    const sourceLang = document.getElementById('sourceLang').value;
    const targetLang = document.getElementById('targetLang').value;
    const outputText = document.getElementById('outputText');
    const spinner = document.getElementById('loadingSpinner');
  
    if (!inputText) {
      alert('Tolong masukkan teks yang ingin diterjemahkan.');
      return;
    }
  
    // Tampilkan spinner
    spinner.style.display = 'block';
    outputText.value = '';
  
    // Mengirimkan permintaan ke backend untuk terjemahan
    const data = {
      source_lang: sourceLang,
      target_lang: targetLang,
      text: inputText
    };
  
    fetch('/translateText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
      if (data.translatedText) {
        outputText.value = data.translatedText;
      } else {
        outputText.value = 'Terjadi kesalahan dalam penerjemahan.';
      }
      spinner.style.display = 'none';
    })
    .catch(error => {
      console.error('Error:', error);
      outputText.value = 'Terjadi kesalahan dalam permintaan.';
      spinner.style.display = 'none';
    });
  }
  
  // Fungsi untuk klik area upload
// Mengubah event listener untuk input dokumen dan gambar
// document.getElementById('uploadImageBox').addEventListener('click', () => {
//   document.getElementById('imageInput').click();
// });

document.getElementById('uploadDocBox').addEventListener('click', () => {
  document.getElementById('docInput').click();
});

// Fungsi untuk handle drag-drop
function handleDrop(event, type) {
  event.preventDefault();
  const files = event.dataTransfer.files;
  handleFile(files, type);
}

// Fungsi untuk menampilkan nama file
function handleFile(files, type) {
  if (files.length > 0) {
      const fileName = files[0].name;
      console.log(fileName)

      // if (type === 'image') {
      //     document.getElementById('imageFileName').innerText = "File Gambar: " + fileName;
      // } else if (type === 'doc') {
      document.getElementById('docFileName').innerText = "File Dokumen: " + fileName;
      // }
  }
}
function handleLangChange() {
  const targetLangElement = document.getElementById('docTargetLang');
  const targetLang = targetLangElement.value;  // Ambil nilai yang dipilih

  console.log("Target Language:", targetLang); // Menampilkan nilai bahasa yang dipilih
}
// Fungsi untuk mengirim data upload menggunakan fetch
function submitUpload() {
  const fileInput = document.getElementById('docInput');
  const targetLang = document.getElementById('docTargetLang').value;
  const spinner = document.getElementById('loadingSpinner');

  if (fileInput.files.length === 0) {
      alert("Tolong pilih dokumen yang ingin diterjemahkan.");
      return;
  }

  // Menampilkan spinner
  spinner.style.display = 'block';

  const formData = new FormData();
  formData.append('file', fileInput.files[0]); // Menambahkan file ke form data
  formData.append('source_language', 'auto'); // Menggunakan 'auto' untuk deteksi otomatis bahasa sumber
  formData.append('target_language', targetLang); // Menambahkan bahasa tujuan
  console.log(targetLang)

  fetch('/upload', {
      method: 'POST',
      body: formData
  })
  .then(response => response.text())  // Mengubah response ke text (karena backend mengirimkan HTML)
  .then(data => {
      // Menyembunyikan spinner dan menampilkan hasil
      spinner.style.display = 'none';
       // Menampilkan hasil dalam elemen tertentu di halaman
      const resultContainer = document.getElementById('resultContainer');
      resultContainer.innerHTML = data; // Menampilkan pesan dari backend
  })
  .catch(error => {
      console.error('Error:', error);
      spinner.style.display = 'none';
      alert("Terjadi kesalahan saat mengirim data.");
  });
}
// Fungsi login sederhana
function login() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const loginError = document.getElementById('loginError');

  // Validasi static: ubah sesuai keinginan
  if (username === 'admin' && password === '123') {
    document.getElementById('loginPage').style.display = 'none';
    document.querySelector('nav').style.display = 'block';
    document.querySelector('main').style.display = 'block';
  } else {
    loginError.textContent = 'Username atau password salah!';
  }
}

// SEMBUNYIKAN navbar dan main saat belum login
window.onload = function() {
  document.querySelector('nav').style.display = 'none';
  document.querySelector('main').style.display = 'none';
};

  
  