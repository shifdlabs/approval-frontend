<template>
  <div class="file-upload-container" @click="openFileDialog">
    <!-- Display image preview or placeholder -->
    <div v-if="imageSrc != ''" class="image-box">
      <img :src="imageSrc" alt="Selected image" />
    </div>
    <div v-else-if="initialUrl != ''" class="image-box">
      <img :src="initialUrl" alt="Selected image" />
    </div> 
    <div v-else :style="emptyImageBox">
      <VIcon color="white" style="min-width: 55px; min-height: 55px;" icon="tabler-photo" />
    </div>
    <input
      ref="fileInput"
      type="file"
      @change="handleFileChange"
      style="display: none"
      accept="image/png"
    />
  </div>
</template>

<script setup>
import { defineEmits, defineProps, ref } from 'vue';

// Allow parent to configure the base directory for images
const props = defineProps({
  initialUrl: { type: String, default: '' },
  // e.g. '/images' for public folder or '/uploads' if served
  imageDir: {
    type: String,
    default: '/images'
  },
  // Placeholder image filename in the imageDir
  placeholder: {
    type: String,
    default: 'placeholder.png'
  },
});

// Emit event to parent with selected File object
const emit = defineEmits(['file-selected']);

// Reference to file input
const fileInput = ref(null);
// Reactive source for the <img> tag
const imageSrc = ref('');

const emptyImageBox = {
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  borderRadius: '8px',
  width: '100px',
  height: '100px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'pointer',
};

// Open file picker
const openFileDialog = () => {
  if (fileInput.value) {
    fileInput.value.value = '';
    fileInput.value.click();
  }
};

// Handle file selection
const handleFileChange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  // Only allow PNG files
  if (file.type !== 'image/png') {
    alert('Only PNG files are allowed.');
    return;
  }

  // 1) Preview locally using ObjectURL
  imageSrc.value = URL.createObjectURL(file);

  // 2) (Optional) Emit file to parent for upload
  emit('file-selected', {
    file,
    filename: file.name,
    size: file.size,
    fileType: file.type
  });

  // 3) (Optional) If you upload to server here, after upload completes,
  //    set imageSrc.value = `${props.imageDir}/${uploadedFilename}`;
};
</script>

<style scoped>
.file-upload-container {
  display: inline-block;
  position: relative;
  cursor: pointer;
}

.image-box {
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  width: 100px;
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.image-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
