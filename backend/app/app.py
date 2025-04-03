from flask import Flask, request, jsonify
import tensorflow as tf
import numpy as np
from werkzeug.utils import secure_filename
import os
from flask_cors import CORS  # Add this import

app = Flask(__name__)
CORS(app)  # Add this line to enable CORS for all routes

# OR for more specific control:
CORS(app, resources={r"/predict": {"origins": "http://localhost:5173"}})
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg'}

# Load trained model
model = tf.keras.models.load_model('./models/marvel_model.h5')
class_names = ['chris_evans', 'chris_hemsworth', 'mark_ruffalo', 'robert_downey_jr', 'scarlett_johansson', 'jeremy_renner']

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def predict_image(img_path):
    img = tf.keras.preprocessing.image.load_img(
        img_path, target_size=(224, 224))
    img_array = tf.keras.preprocessing.image.img_to_array(img)
    img_array = tf.expand_dims(img_array, 0) / 255.0
    
    predictions = model.predict(img_array)
    actor = class_names[np.argmax(predictions[0])]
    confidence = float(np.max(predictions[0]))
    
    return {
        'actor': actor.replace('_', ' ').title(),
        'character': get_character(actor),
        'confidence': confidence
    }

def get_character(actor):
    character_map = {
        'robert_downey_jr': 'Tony Stark/Iron Man',
        'chris_evans': 'Steve Rogers/Captain America',
        'chris_hemsworth': 'Thor',
        'scarlett_johansson': 'Natasha Romanoff/Black Widow',
        'mark_ruffalo': 'Bruce Banner/Hulk',
        'jeremy_renner': 'Clint Barton/Hawkeye'
    }
    return character_map.get(actor, 'Unknown Character')

@app.route('/predict', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
        
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        save_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(save_path)
        
        result = predict_image(save_path)
        os.remove(save_path)
        
        return jsonify(result)
    
    return jsonify({'error': 'File type not allowed'}), 400
@app.route('/')
def home():
    return "Server is running"
if __name__ == '__main__':
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    port = int(os.environ.get('PORT', 5000))
    print(f"Starting server on port {port}")
    app.run(debug=True)