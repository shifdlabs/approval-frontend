<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import * as XLSX from 'xlsx';

interface Props {
  isDialogVisible: boolean;
  isRefetchList: boolean;
  positions: any[];
}

interface Emit {
  (e: 'update:isDialogVisible', val: boolean): void;
  (e: 'update:isRefetchList', val: boolean): void;
}

const emit = defineEmits<Emit>();
const props = defineProps<Props>();

// Step tracking
const currentStep = ref(1);
const totalSteps = 3;

// File upload
const selectedFile = ref<File | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);

// Column mapping
const excelColumns = ref<string[]>([]);
const columnMapping = ref({
  employeeID: '',
  email: '',
  firstName: '',
  lastName: '',
  phone: '',
  role: '',
  position: '',
  positionID: '',
  password: '',
});

// Preview data
const previewData = ref<any[]>([]);
const previewErrors = ref<any[]>([]);
const previewWarnings = ref<any[]>([]);
const isLoadingPreview = ref(false);

// Bulk import
const isImporting = ref(false);
const importResult = ref<any>(null);
const customPassword = ref('');
const showPassword = ref(false);
const showSuccessDialog = ref(false);
const successMessage = ref('');

const previewHeaders = [
  { title: 'Employee ID', key: 'employeeID' },
  { title: 'Email', key: 'email' },
  { title: 'First Name', key: 'firstName' },
  { title: 'Last Name', key: 'lastName' },
  { title: 'Phone', key: 'phone' },
  { title: 'Role', key: 'role' },
  { title: 'Position', key: 'positionID' },
];


watch(
  () => props.isDialogVisible,
  (isVisible) => {
    if (isVisible) {
      resetDialog();
    }
  }
);

const resetDialog = () => {
  currentStep.value = 1;
  selectedFile.value = null;
  excelColumns.value = [];
  columnMapping.value = {
    employeeID: '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: '',
    position: '',
    positionID: '',
    password: '',
  };
  previewData.value = [];
  previewErrors.value = [];
  previewWarnings.value = [];
  importResult.value = null;
  customPassword.value = '';
  showPassword.value = false;
  showSuccessDialog.value = false;
};

const onFileSelected = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const file = input.files[0];
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must not exceed 10MB. Please upload a smaller file.');
      input.value = '';
      return;
    }
    selectedFile.value = file;
    parseExcelHeaders();
  }
};

const parseExcelHeaders = async () => {
  if (!selectedFile.value) return;

  try {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const data = e.target?.result;
      if (!data) return;

      const workbook = XLSX.read(data, { type: 'binary' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Get range of the worksheet
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
      
      // Extract headers from first row
      const headers: string[] = [];
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: range.s.r, c: col });
        const cell = worksheet[cellAddress];
        if (cell && cell.v) {
          headers.push(String(cell.v));
        }
      }
      
      excelColumns.value = headers;
      currentStep.value = 2;
    };
    
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      alert('Failed to read Excel file');
    };
    
    reader.readAsBinaryString(selectedFile.value);
  } catch (error) {
    console.error('Error parsing Excel:', error);
    alert('Failed to parse Excel file');
  }
};

const goToNextStep = () => {
  if (currentStep.value < totalSteps) {
    if (currentStep.value === 2) {
      // Validate column mapping and load preview
      loadPreview();
    } else {
      currentStep.value++;
    }
  }
};

const goToPreviousStep = () => {
  if (currentStep.value > 1) {
    // Clear preview data when going back from Step 3 to Step 2
    if (currentStep.value === 3) {
      previewData.value = [];
      previewErrors.value = [];
      previewWarnings.value = [];
    }
    currentStep.value--;
  }
};

const remapColumns = () => {
  // Clear preview data and go back to Step 2 for remapping
  previewData.value = [];
  previewErrors.value = [];
  previewWarnings.value = [];
  currentStep.value = 2;
};

const loadPreview = async () => {
  if (!selectedFile.value) return;

  isLoadingPreview.value = true;
  
  try {
    const formData = new FormData();
    formData.append('file', selectedFile.value);
    formData.append('columnMapping', JSON.stringify(columnMapping.value));

    const { data, error } = await useApi('/user/import/preview', {
      method: 'POST',
      body: formData,
    }).json<{ data: { users: any[], errors: any[], warnings: any[] } }>();

    if (data.value?.data) {
      previewData.value = data.value.data.users || [];
      previewErrors.value = data.value.data.errors || [];
      previewWarnings.value = data.value.data.warnings || [];
      
      // Validate email format using proper regex
      const emailRegex = /^(?:[^<>()[\]\\.,;:\s@"]+(?:\.[^<>()[\]\\.,;:\s@"]+)*|".+")@(?:\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\]|(?:[a-z\-\d]+\.)+[a-z]{2,})$/i;
      const invalidEmails = previewData.value.filter(user =>
        user.email && !emailRegex.test(String(user.email))
      );

      if (invalidEmails.length > 0) {
        alert(`Warning: ${invalidEmails.length} row(s) have invalid email format.\n\nPlease check your column mapping in Step 2!`);
        currentStep.value = 2;
        return;
      }
      
      // Only change step if not already at step 3 (e.g., when clicking Refresh Preview)
      if (currentStep.value !== 3) {
        currentStep.value = 3;
      }
    } else {
      console.error('Failed to load preview:', error.value);
      alert('Failed to load preview. Please check your file and column mapping.');
    }
  } catch (e) {
    console.error('Error loading preview:', e);
    alert('An error occurred while loading preview.');
  } finally {
    isLoadingPreview.value = false;
  }
};

const performBulkImport = async () => {
  if (previewData.value.length === 0) return;

  if (customPassword.value) {
    const pwRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%&*()]).{8,}/;
    if (!pwRegex.test(customPassword.value)) {
      alert('Custom password must be at least 8 characters and contain uppercase, lowercase, a digit, and a special character (!@#$%&*()).');
      return;
    }
  }

  isImporting.value = true;

  try {
    
    const { data, error } = await useApi('/user/import/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        users: previewData.value,
        customPassword: customPassword.value || '',
      }),
    }).json<{ data: { successCount: number, failedCount: number, errors: any[] } }>();

    if (data.value?.data) {
      importResult.value = data.value.data;
      console.log('Bulk import result:', data.value.data);
      
      // Check if any users were successfully imported
      if (data.value.data.successCount > 0) {
        console.log(`Import successful: ${data.value.data.successCount} users created`);
        emit('update:isRefetchList', true);
        
        // Show success dialog
        successMessage.value = `Successfully imported ${data.value.data.successCount} user(s).${data.value.data.failedCount > 0 ? ` Failed: ${data.value.data.failedCount}` : ''}`;
        showSuccessDialog.value = true;
        
        // Auto close success dialog after 2 seconds, then close parent dialog
        setTimeout(() => {
          showSuccessDialog.value = false;
          setTimeout(() => {
            emit('update:isDialogVisible', false);
          }, 300);
        }, 2000);
      } else {
        // All imports failed - show error details
        let errorMessage = `Import failed! ${data.value.data.failedCount} user(s) could not be imported.\n\n`;
        if (data.value.data.errors && data.value.data.errors.length > 0) {
          errorMessage += 'Errors:\n';
          data.value.data.errors.forEach((err: any) => {
            errorMessage += `Row ${err.row} (${err.field}): ${err.message}\n`;
          });
        }
        alert(errorMessage);
      }
    } else {
      console.error('Bulk import failed:', error.value);
      alert('Bulk import failed. Please try again.');
    }
  } catch (e) {
    console.error('Error during bulk import:', e);
    alert('An error occurred during bulk import.');
  } finally {
    isImporting.value = false;
  }
};

const canProceedToNextStep = computed(() => {
  if (currentStep.value === 1) {
    return selectedFile.value !== null;
  } else if (currentStep.value === 2) {
    // At least email and firstName should be mapped
    return columnMapping.value.email !== '' && columnMapping.value.firstName !== '';
  }
  return false;
});

const getRoleText = (role: number) => {
  if (role === 99) return 'Admin';
  if (role === 1) return 'User';
  if (role === 0) return '-';
  return `Role ${role}`;
};

const getPositionName = (positionID: string) => {
  if (!positionID) return '-';
  const position = props.positions.find(p => p.id === positionID);
  return position ? position.name : '-';
};
</script>

<template>
  <VDialog
    :model-value="props.isDialogVisible"
    max-width="1200"
    persistent
    @update:model-value="(val) => emit('update:isDialogVisible', val)"
  >
    <VCard class="bm-dialog" style="border-radius: 16px !important;">
      <div class="bmd-head">
        <div class="bmd-mark">
          <VIcon icon="tabler-file-upload" size="22" />
        </div>
        <div class="bmd-titles">
          <h2>Import Users from Excel</h2>
          <p>Upload an Excel file and map columns to user fields</p>
        </div>
        <button class="bmd-close" type="button" @click="emit('update:isDialogVisible', false)">
          <VIcon icon="tabler-x" size="18" />
        </button>
      </div>

      <VDivider />

      <VCardText class="pa-6">
        <!-- Stepper -->
        <VStepper v-model="currentStep" :items="totalSteps" flat>
          <!-- Step 1: Upload File -->
          <VStepperItem value="1" title="Upload Excel File">
            <div class="pa-4">
              <p class="text-body-1 mb-4">
                Upload an Excel file (.xlsx) containing user data.
              </p>

              <VFileInput
                ref="fileInputRef"
                v-model="selectedFile"
                label="Select Excel File"
                accept=".xlsx,.xls"
                prepend-icon="tabler-file-upload"
                @change="onFileSelected"
              />

              <VAlert v-if="selectedFile" type="success" class="mt-4">
                File selected: {{ selectedFile.name }}
              </VAlert>
            </div>
          </VStepperItem>

          <!-- Step 2: Column Mapping -->
          <VStepperItem value="2">
            <div class="pa-4">
              <VAlert color="#7166e8" class="mb-4">
                Fields marked with * are required.
              </VAlert>

              <VRow>
                <VCol cols="12" md="6">
                  <AppSelect
                    v-model="columnMapping.employeeID"
                    label="Employee ID Column"
                    placeholder="Select column"
                    :items="excelColumns"
                    clearable
                  />
                </VCol>

                <VCol cols="12" md="6">
                  <AppSelect
                    v-model="columnMapping.email"
                    label="Email Column *"
                    placeholder="Select column"
                    :items="excelColumns"
                    clearable
                  />
                </VCol>

                <VCol cols="12" md="6">
                  <AppSelect
                    v-model="columnMapping.firstName"
                    label="First Name Column *"
                    placeholder="Select column"
                    :items="excelColumns"
                    clearable
                  />
                </VCol>

                <VCol cols="12" md="6">
                  <AppSelect
                    v-model="columnMapping.lastName"
                    label="Last Name Column"
                    placeholder="Select column"
                    :items="excelColumns"
                    clearable
                  />
                </VCol>

                <VCol cols="12" md="6">
                  <AppSelect
                    v-model="columnMapping.phone"
                    label="Phone Column"
                    placeholder="Select column"
                    :items="excelColumns"
                    clearable
                  />
                </VCol>

                <VCol cols="12" md="6">
                  <AppSelect
                    v-model="columnMapping.role"
                    label="Role Column (99=Admin, 1=User)"
                    placeholder="Select column"
                    :items="excelColumns"
                    clearable
                  />
                </VCol>

                <VCol cols="12" md="6">
                  <AppSelect
                    v-model="columnMapping.position"
                    label="Position Name Column (e.g., Manager, Staff)"
                    placeholder="Select column"
                    :items="excelColumns"
                    clearable
                  />
                </VCol>

                <VCol cols="12" md="6">
                  <AppSelect
                    v-model="columnMapping.positionID"
                    label="Position ID Column (alternative)"
                    placeholder="Select column"
                    :items="excelColumns"
                    clearable
                  />
                </VCol>

                <VCol cols="12" md="6">
                  <AppSelect
                    v-model="columnMapping.password"
                    label="Password Column (optional)"
                    placeholder="Select column"
                    :items="excelColumns"
                    clearable
                  />
                </VCol>
              </VRow>
            </div>
          </VStepperItem>

          <!-- Step 3: Preview -->
          <VStepperItem value="3" title="Preview & Import">
            <div class="pa-4">
              <div class="d-flex justify-space-between align-center mb-4">
                <div>
                  <p class="text-body-1 ma-0 mb-1">
                    Review the data before importing. Total users: {{ previewData.length }}
                  </p>
                  <p class="text-caption text-medium-emphasis ma-0">
                    Need to change column mapping? Click the button on the right
                  </p>
                </div>
                <VBtn
                  color="#7166e8"
                  variant="tonal"
                  size="small"
                  prepend-icon="tabler-edit"
                  @click="remapColumns"
                >
                  Edit Mapping
                </VBtn>
              </div>

              <!-- Password Configuration Section -->
              <VDivider class="mb-4" />
              <div class="text-h6 mb-3">
                <VIcon icon="tabler-key" color="#7166e8" class="me-2" />
                Password Configuration
              </div>
              <VRow class="mb-4">
                <VCol cols="12" md="6">
                  <AppTextField
                    v-model="customPassword"
                    :type="showPassword ? 'text' : 'password'"
                    label="Custom Password for All Users (Optional)"
                    placeholder="Leave empty to auto-generate a secure random password"
                    hint="Must be 8+ chars with uppercase, lowercase, digit, and special character (!@#$%&*())"
                    persistent-hint
                    :append-inner-icon="showPassword ? 'tabler-eye-off' : 'tabler-eye'"
                    @click:append-inner="showPassword = !showPassword"
                  />
                </VCol>
              </VRow>
              <VDivider class="mb-4" />

              <VAlert color="#7166e8" class="mb-4">
                <strong>Default Values:</strong> Fields not mapped will use defaults during import:
                <ul class="mt-2">
                  <li>Role: Regular User (1)</li>
                  <li>Password: {{ customPassword ? 'Custom password set' : 'Auto-generated (secure random)' }}</li>
                  <li>Access: Enabled</li>
                </ul>
              </VAlert>

              <!-- Errors -->
              <VAlert v-if="previewErrors.length > 0" type="error" class="mb-4">
                <div class="text-h6 mb-2">Errors ({{ previewErrors.length }})</div>
                <ul>
                  <li v-for="(error, idx) in previewErrors" :key="idx">
                    Row {{ error.row }}: {{ error.field }} - {{ error.message }}
                  </li>
                </ul>
              </VAlert>

              <!-- Warnings -->
              <VAlert v-if="previewWarnings.length > 0" type="warning" class="mb-4">
                <div class="text-h6 mb-2">Warnings ({{ previewWarnings.length }})</div>
                <ul>
                  <li v-for="(warning, idx) in previewWarnings" :key="idx">
                    Row {{ warning.row }}: {{ warning.field }} - {{ warning.message }}
                  </li>
                </ul>
              </VAlert>

              <!-- Preview Data Section -->
              <div class="text-h6 mb-3">
                <VIcon icon="tabler-table" color="#7166e8" class="me-2" />
                Preview Data
              </div>

              <!-- Preview Table -->
              <VDataTable
                :headers="previewHeaders"
                :items="previewData"
                :items-per-page="10"
                density="comfortable"
                class="preview-table"
              >
                <template #item.role="{ item }">
                  <VChip 
                    :color="item.role === 99 ? '#7166e8' : item.role === 1 ? 'default' : 'secondary'" 
                    size="small"
                  >
                    {{ getRoleText(item.role) }}
                  </VChip>
                </template>
                <template #item.positionID="{ item }">
                  <VChip 
                    color="default" 
                    size="small"
                  >
                    {{ getPositionName(item.positionID) }}
                  </VChip>
                </template>
              </VDataTable>
            </div>
          </VStepperItem>
        </VStepper>
      </VCardText>

      <VDivider />

      <div class="bmd-foot" style="border-top: 1px solid var(--bm-line-soft);">
        <VBtn
          v-if="currentStep > 1"
          class="bmd-btn-ghost"
          variant="text"
          style="height:50px; border-radius:13px; font-weight:700; border: 1.5px solid oklch(0.88 0.025 264); color: var(--bm-navy);"
          @click="goToPreviousStep"
        >
          Previous
        </VBtn>
        <VSpacer />

        <VBtn
          v-if="currentStep < totalSteps"
          :disabled="!canProceedToNextStep || isLoadingPreview"
          :loading="isLoadingPreview"
          class="bmd-btn-primary"
          style="height:50px; border-radius:13px; font-weight:700; background: var(--bm-navy); color:#fff;"
          @click="goToNextStep"
        >
          Next
        </VBtn>

        <VBtn
          v-if="currentStep === totalSteps"
          :disabled="previewData.length === 0 || isImporting"
          :loading="isImporting"
          class="bmd-btn-primary"
          style="height:50px; border-radius:13px; font-weight:700; background: var(--bm-navy); color:#fff;"
          @click="performBulkImport"
        >
          Bulk Insert ({{ previewData.length }} users)
        </VBtn>
      </div>
    </VCard>
  </VDialog>

  <!-- Success Dialog -->
  <VDialog v-model="showSuccessDialog" max-width="400">
    <VCard class="bm-dialog">
      <div class="bmd-head">
        <div class="bmd-mark" style="background: oklch(0.56 0.14 148);">
          <VIcon icon="tabler-circle-check" size="22" />
        </div>
        <div class="bmd-titles">
          <h2>Import Successful!</h2>
          <p>{{ successMessage }}</p>
        </div>
      </div>
    </VCard>
  </VDialog>
</template>

<style scoped>
.preview-table {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 4px;
}

:deep(.preview-table .v-data-table__wrapper) {
  background-color: rgb(var(--v-theme-surface));
}

:deep(.preview-table .v-data-table__thead) {
  background-color: rgba(113, 102, 232, 0.08); /* #7166e8 with opacity */
}

:deep(.preview-table .v-data-table__thead th) {
  font-weight: 600 !important;
  color: rgb(var(--v-theme-on-surface)) !important;
}

:deep(.preview-table tbody tr) {
  background-color: rgb(var(--v-theme-surface));
}

:deep(.preview-table tbody tr:nth-child(even)) {
  background-color: rgba(var(--v-theme-on-surface), 0.02);
}

:deep(.preview-table tbody tr:hover) {
  background-color: rgba(113, 102, 232, 0.08) !important; /* #7166e8 with opacity */
}

.elevation-1 {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
