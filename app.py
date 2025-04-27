import os
from flask import Flask, render_template, request, redirect, url_for, send_from_directory
from werkzeug.utils import secure_filename
import pdfplumber
from deep_translator import GoogleTranslator
from docx import Document
import pandas as pd

# Inisialisasi aplikasi Flask
app = Flask(__name__)

# Tentukan folder upload dan ekstensi file yang diizinkan
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'xlsx'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Fungsi untuk memeriksa ekstensi file yang diizinkan
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Fungsi untuk mengekstrak teks dari PDF
def extract_text_from_pdf(pdf_path):
    with pdfplumber.open(pdf_path) as pdf:
        text = ""
        for page in pdf.pages:
            text += page.extract_text()
    return text

# Fungsi untuk menerjemahkan teks
def translate_text(text, source_language='en', target_language='id'):
    translated_text = GoogleTranslator(source=source_language, target=target_language).translate(text)
    return translated_text

# Fungsi untuk menyimpan teks terjemahan ke dalam file Word
def save_to_word(text, output_word_path):
    doc = Document()
    doc.add_paragraph(text)
    doc.save(output_word_path)

# Fungsi untuk menyimpan teks terjemahan ke dalam file Excel
def save_to_excel(text, output_excel_path):
    # Convert the translated text into a pandas DataFrame
    df = pd.DataFrame([text.split('\n')], columns=['Translated Text'])
    df.to_excel(output_excel_path, index=False)

# Fungsi untuk mengekstrak teks dari file Word
def extract_text_from_word(docx_path):
    doc = Document(docx_path)
    text = ""
    for para in doc.paragraphs:
        text += para.text + "\n"
    return text

# Fungsi untuk mengekstrak teks dari file Excel
def extract_text_from_excel(excel_path):
    df = pd.read_excel(excel_path)
    text = ""
    for index, row in df.iterrows():
        text += " ".join([str(cell) for cell in row]) + "\n"
    return text

# Route untuk halaman utama
@app.route('/')
def index():
    return render_template('index.html')

# Route untuk menangani upload file
@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return redirect(request.url)
    file = request.files['file']

    # Pastikan file memiliki nama dan ekstensi yang valid
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        # Mendapatkan bahasa sumber dan target dari form
        source_language = request.form['source_language']
        target_language = request.form['target_language']

        # Deteksi ekstensi file
        if filename.lower().endswith('.pdf'):
            # Ekstrak teks dari PDF
            text = extract_text_from_pdf(file_path)
        elif filename.lower().endswith('.docx'):
            # Ekstrak teks dari Word
            text = extract_text_from_word(file_path)
        elif filename.lower().endswith('.xlsx'):
            # Ekstrak teks dari Excel
            text = extract_text_from_excel(file_path)

        # Terjemahkan teks
        translated_text = translate_text(text, source_language=source_language, target_language=target_language)

        # Simpan hasil terjemahan ke dalam file Word
        file_name_without_extension = os.path.splitext(filename)[0]
        output_word_path = os.path.join(app.config['UPLOAD_FOLDER'], f'terjemahan_{file_name_without_extension}.docx')
        save_to_word(translated_text, output_word_path)

        # Simpan hasil terjemahan ke dalam file Excel
        output_excel_path = os.path.join(app.config['UPLOAD_FOLDER'], f'terjemahan_{file_name_without_extension}.xlsx')
        save_to_excel(translated_text, output_excel_path)

        # Memberikan link untuk mengunduh file terjemahan dalam format Word dan Excel
        return f"""File berhasil diupload dan diterjemahkan. 
                  <a href='/uploads/{f'terjemahan_{file_name_without_extension}.docx'}'>Unduh file Word</a> | 
                  <a href='/uploads/{f'terjemahan_{file_name_without_extension}.xlsx'}'>Unduh file Excel</a>"""

    return "File tidak valid, pastikan file berformat PDF, DOCX, atau XLSX."

# Route untuk menangani pengunduhan file
@app.route('/uploads/<filename>')
def download_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Menjalankan aplikasi
if __name__ == '__main__':
    app.run(debug=True)
