<script lang="ts" setup>
import A4PaperView from "@/components/A4PaperView.vue";
import { BookedDocumentNumber } from '@/models/document-number/document-number';
import { Format, GroupWithFormats } from '@/models/document-number/group.with.format';
import { Document } from '@/models/document/document';
import { DocumentReference } from "@/models/document/reference.document";
import { User } from '@/models/users/users';
import { router } from '@/plugins/1.router';
import { mapGroupedWithFormat } from "@/utils/model.mapper";
import { documentPublicationNumberTypes } from "@/utils/static.value";
import { VForm } from 'vuetify/components/VForm';

const currentTab = ref(1)
const previewPanel = ref(1)
const isDialogVisible = ref(false)
const isInvalidFormVisible = ref(false)
const isSuccessDialogVisible = ref(false)
const isSuccessSaveAsDraftDialogVisible = ref(false)
const document = ref<Document>({
  id: '',
  publicationNumberType: 0,
  publicationValue: '',
  externalRecipient: '',
  subject: '',
  body: '',
  type: '',
  priority: null,
  step: 0,
  status: 0,
  updatedAt: '',
  isApprover: false,
  currentApprovalName: '',
  lastRejector: null,
  attachments: null
})


const deleteDialogVisible = ref(false)
const usersList = ref<User[]>([])
const references = ref<DocumentReference[]>([])

const selectedType = ref('')
const selectedLetterheadType = ref('')
const isInternalRecipientsEnable = ref(false)
const isExternalRecipientsEnable = ref(false)
const isCarbonCopyEnable = ref(false)
const selectedInternalRecipients = ref<User[]>([])
const selectedCarbonCopy = ref<User[]>([])
const groupedWithFormat = ref<GroupWithFormats[]>([])
const bookedNumbers = ref<BookedDocumentNumber[]>([])
const approvers = ref([
{
  userID: '',
  signature: false
}
])
const publicationNumberTypeInput = ref<number | null>(null); // store selected group name
const selectedGroupName = ref<string | null>(null); // store selected group name
const selectedFormatId = ref<string | null>(null);  // store selected format id
const selectedBookedNumber = ref<string | null>(null); // store selected group name
const customInputNumber = ref<string>(''); // store custom input number
const refForm = ref<VForm>()

const isLoaderVisible = ref(false)
const isUploading = ref(false)
const uploadingFiles = ref<File[]>([])
// Reference to the hidden file input
const fileInput = ref<HTMLInputElement | null>(null)
const totalTabs = documentTabs.length

const selectedReferenceDocument = ref<DocumentReference[]>([])
const loadingReferenceDocument = ref(false)
const searchReferenceDocument = ref()

watch(searchReferenceDocument, query => {
  if (query && query.length >= 3) {
    fetchDocumentReference(query)
  } else {
    references.value = []
  }
})

onMounted(() => {
    fetchUsers()
    fetchBookedNumbers()
    fetchNumberingFormat()
})

watch(
      () => document.value.type,
      (newValue, oldValue) => {
       if (newValue == '1') {
        selectedInternalRecipients.value = []
        isInternalRecipientsEnable.value = true
        isExternalRecipientsEnable.value = false
        document.value.externalRecipient = ''
       } else if (newValue == '2') {
        selectedInternalRecipients.value = []
        isInternalRecipientsEnable.value = false
        isExternalRecipientsEnable.value = true
        document.value.externalRecipient = ''
       }
      }
    )

watch(isLoaderVisible, value => {
  if (!value)
    return

  setTimeout(() => {
    isLoaderVisible.value = false
    isSuccessDialogVisible.value = true
  }, 2000)
})

watch(isSuccessDialogVisible, value => {
  if (!value)
    return

  setTimeout(() => {
    isLoaderVisible.value = false
    router.replace('/reguler/progress')
  }, 2000)
})
      const fetchBookedNumbers = async () => {
        try {
          const res = await useApi('/document/number/user', {
            method: 'GET'
          })
          const value = res.data.value as { data: any };
          bookedNumbers.value = value.data.map((bookingNumbers: any) => mapBookingNumber(bookingNumbers));
        } catch (e) {
          console.log(e)
        }
      }

const signers = computed<User[]>(() => {
  const approverWithSignatureIds = approvers.value.filter(item => item.signature === true).map(filteredData => filteredData.userID)
  return usersList.value.filter(user => approverWithSignatureIds.includes(user.id))
})

const bookingNumber = computed<string | null>(() => {
  const publicationNumberType = publicationNumberTypeInput.value;
  var publicationValue = null;
    if (publicationNumberType === 1) {
      publicationValue = "[Auto Generate]";
    } else if (publicationNumberType === 2) {
      const found = bookedNumbers.value.find(item => item.id === selectedBookedNumber.value);
      publicationValue = found ? found.DocumentNumber : null;
    } else if (publicationNumberType === 3) {
      publicationValue = customInputNumber.value || '';
    } else {
      publicationValue = null;
    }

    return publicationValue
})

const formatsForSelectedGroup = computed<Format[]>(() => {
  const group = groupedWithFormat.value.find(g => g.group === selectedGroupName.value);
  return group ? group.formats : [];
});

const preTab = () => {
  if (currentTab.value !== 1)
    currentTab.value -= 1
}

const nextTab = () => {
  if (currentTab.value !== totalTabs)
    currentTab.value += 1
}

const sendDocument = () => {
  createDocument(false)
  isDialogVisible.value = false
}

const fetchNumberingFormat = async () => {
        try {
          const res = await useApi('/numbering/format/grouped', {
            method: 'GET'
          });

          // Properly type the response
          const value = res.data.value as { data: any[] };

          // Map the raw data into your GroupWithFormats[]
          groupedWithFormat.value = value.data.map(mapGroupedWithFormat);
        } catch (e) {
          console.log(e);
        }
};

const fetchDocumentReference = async (query: string) => {
  loadingReferenceDocument.value = true
  try {
    const res = await useApi(`/document/references/${query}`, {
            method: 'GET'
      });

    setTimeout(() => {
    // Properly type the response
    const value = res.data.value as { data: any[] };
    references.value = value.data.map(mapDocumentReference)
    loadingReferenceDocument.value = false
    }, 500)
  } catch (e) {
    console.log(e);
  }
}

const saveAsDraft = () => {
  createDocument(true)
}

const fetchUsers = async () => {
        try {
          const res = await useApi('/user/except-current', {
            method: 'GET'
          })
 
          const value = res.data.value as { data: any };
          usersList.value = value.data.map((user: any) => mapUser(user));
        } catch (e) {
          console.log(e)
        }
      }

function addApprover() {
  approvers.value.push({
    userID: '',
    signature: false
  })
}

function removeApprover(index: number) {
  approvers.value.splice(index, 1)
}

function showSubmitDialog() {
  refForm.value?.validate().then(isValid => {
    if (isValid.valid) {
      isInvalidFormVisible.value = false
      isDialogVisible.value = true
    } else {
      isInvalidFormVisible.value = true
    }
  })
}

function onToggle(type: number) {
    if (type == 1) {
        selectedInternalRecipients.value = []
    } else if (type == 2) {
        document.value.externalRecipient = ''
    }
}

const createDocument = async (isDraft: boolean) => {
  try {
    const authorId = useCookie('userId').value
    const publicationNumberType = publicationNumberTypeInput.value
    const type = selectedType.value == '1' ? 1 : 2
    const priority = document.value.priority
    const subject = document.value.subject
    const body = document.value.body
    const letterHead = selectedLetterheadType.value == '1' ? false : true
    const externalRecipients = document.value.externalRecipient
    const internalRecipients = selectedInternalRecipients.value.map(user => user.id)
    const carbonCopies = selectedCarbonCopy.value.map(user => user.id)
    const references = selectedReferenceDocument.value.map(reference => reference.id)

    let publicationValue = ''
    if (publicationNumberType === 1) {
      publicationValue = selectedFormatId.value || ''
    } else if (publicationNumberType === 2) {
      publicationValue = selectedBookedNumber.value || ''
    } else if (publicationNumberType === 3) {
      publicationValue = customInputNumber.value || ''
    }

    const sequences = approvers.value
    const attachments =
      isDraft || uploadingFiles.value.length === 0
        ? []
        : convertToFileRequest(uploadingFiles)

    // ✅ Move useApi call inside the function
    const { execute, error } = useApi(
      '/document',
      {
        method: 'POST',
        body: JSON.stringify({
          authorId,
          publicationNumberType,
          publicationValue,
          type,
          priority,
          subject,
          body,
          externalRecipient: externalRecipients,
          step: 1,
          letterHead,
          status: isDraft ? 0 : 1,
          recipients: internalRecipients,
          carbonCopies,
          sequences,
          attachments,
          references,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      },
      {
        immediate: false,
      }
    )

    await execute()

    if (error.value) {
      console.error('API Error:', error.value)
      return
    }

    if (!isDraft && uploadingFiles.value.length > 0) {
      console.log('Uploading files...', uploadingFiles.value)
      await uploadAllFiles(uploadingFiles)
    }

    if (isDraft) {
      isSuccessSaveAsDraftDialogVisible.value = true

      setTimeout(() => {
        isSuccessSaveAsDraftDialogVisible.value = false
        router.replace('/reguler/draft')
      }, 2500)
    } else {
      isLoaderVisible.value = true
    }
  } catch (e) {
    console.error('Unexpected Exception:', e)
  }
}

const onFileChange = (event: Event) => {
  handleFileChange(event, uploadingFiles)
}

const onFileClick = () => {
  handleFileClick(fileInput, isLoaderVisible, isUploading)
}

const onFileDrop = (event: DragEvent) => {
  handleFileDrop(event, uploadingFiles, isLoaderVisible, isUploading)
}

const onFileRemoved = (index: number) => {
  handleRemoveFile(index, uploadingFiles)
}
</script>

<template>
  <VCard class="pt-4">
    <VTabs v-model="currentTab">
        <VTab
        v-for="item in documentTabs.length"
        :key="item"
        :value="item"
      >
        {{ documentTabs[item - 1] }}
      </VTab>
    </VTabs>

    <VForm
      ref="refForm"
    >
    <VCardText>
      <VWindow v-model="currentTab">
        <VWindowItem :value="1">
          <VRow>
          <VCol cols="12">
            <AppTextField
              :rules="[requiredValidator]"
              v-model="document.subject"
              label="Subject *"
              placeholder="Example: Official Announcement"
              class="me-3"
            />
          </VCol>

            <VCol
            cols="12">
            <VLabel>Reference *</VLabel>
            <VAutocomplete
              v-model="selectedReferenceDocument"
              v-model:search="searchReferenceDocument"
              :loading="loadingReferenceDocument"
              :items="references"
              placeholder="Search for Reference"
              :menu-props="{ maxHeight: '200px' }"
              multiple
              chips
            />
          </VCol>

          <VCol 
            cols="12">
            <AppSelect
                v-model="publicationNumberTypeInput"
                label="Publication Number *"
                placeholder="Select Priority Type"
                :items="documentPublicationNumberTypes"
                item-title="title"
                item-value="value"
                clearable
            />
          </VCol>

          <VCol cols="12" sm="6" v-if="publicationNumberTypeInput === 1">
                <AppSelect
                        v-model="selectedGroupName"
                        label="Group of Format"
                        placeholder="Select Group Format"
                        :items="groupedWithFormat"
                        item-value="group"
                        item-title="group"
                        clearable
                ></AppSelect>
            </VCol>
            <VCol cols="12" sm="6" v-if="publicationNumberTypeInput === 1">
                <AppSelect
                        v-model="selectedFormatId"
                        label="Format Name"
                        placeholder="Select Format Name"
                        :items="formatsForSelectedGroup"
                        item-value="id"
                        item-title="name"
                        clearable
                ></AppSelect>
            </VCol>

            <VCol cols="12" v-if="publicationNumberTypeInput === 2">
                <AppSelect
                        v-model="selectedBookedNumber"
                        label="Booked Number"
                        placeholder="Select Your Booked Number"
                        :items="bookedNumbers"
                        item-value="id"
                        item-title="DocumentNumber"
                        clearable
                ></AppSelect>
            </VCol>

            <VCol cols="12" v-if="publicationNumberTypeInput === 3">
              <AppTextField
                :rules="[requiredValidator]"
                v-model="customInputNumber"
                label="Custom Number *"
                placeholder="Example: 01/Gov/R/2/2025"
                class="me-3"
              />
            </VCol>

          <VCol 
            cols="12">
            <AppSelect
                v-model="document.priority"
                label="Priority *"
                placeholder="Select Priority Type"
                :items="documentPriorityType"
                item-title="title"
                item-value="value"
                clearable
                :rules="[requiredValidator]"
            />
          </VCol>

          <VCol
            cols="12"
          >
            <VLabel>Document Type *</VLabel>
            <CustomRadios
                v-model:selected-radio="document.type"
                :radio-content="documentType"
                :grid-column="{ sm: '6', cols: '12' }"
                :rules="[requiredValidator]"
            />
          </VCol>

          <VCol
            cols="12">
            <AppCombobox
                :disabled="!isInternalRecipientsEnable"
                v-model="selectedInternalRecipients"
                :items="usersList"
                placeholder="Select Internal Approver"
                item-title="title"
                item-value="id"
                label="Internal Recipients"
                multiple
                chips
            />
          </VCol>

          <VCol
            cols="12">
            <AppTextField
              label="External Recipients (Add a comma ',' if multiple items)"
                :disabled="!isExternalRecipientsEnable"
              v-model="document.externalRecipient"
              placeholder="Input your external recipient name"
            />
          </VCol>

          <VCol
            cols="12">
            <VCheckbox
                v-model="isCarbonCopyEnable"
                label="CC (Carbon Copy)"
                density="compact"
                @change="onToggle(3)"
            />
            <AppCombobox
                :disabled="!isCarbonCopyEnable"
                v-model="selectedCarbonCopy"
                :items="usersList"
                placeholder="Select Carbon Copy"
                item-title="title"
                item-value="id"
                multiple
                chips
            />
          </VCol>

          <VCol
            cols="12"
            class="d-flex flex-wrap gap-4 justify-end"
          >
            <VBtn
                color="primary"
                variant="tonal"
                style="width: 105px;"
                @click="nextTab"
              >
                Next
              </VBtn>
          </VCol>
          </VRow>
        </VWindowItem>

        <VWindowItem :value="2">
            <VRow>
                <VCol
                cols="12"
                >
                <VLabel class="mb-3">Write your message body in this field. *</VLabel>
                <TiptapEditor
                    v-model="document.body"
                    class="border rounded basic-editor"
                    :rules="[requiredValidator]"
                />
                </VCol>

                <VCol
                cols="12"
                class="d-flex flex-wrap gap-4 justify-end"
                >

                <VBtn
                    :v-if="currentTab > 1"
                    variant="outlined"
                    @click="preTab"
                >
                Previous
                </VBtn>
                <VBtn
                    color="primary"
                    variant="tonal"
                    style="width: 105px;"
                    @click="nextTab"
                >
                Next
              </VBtn>
            </VCol>
            </VRow>
        </VWindowItem>

        <VWindowItem :value="3">
            <div class="d-flex gap-24 align-start flex-wrap mb-3">
                <!-- Title + Subtitle -->
                <div>
                    <VLabel style="font-size: 16px;">Select Approvers *</VLabel>
                    <div class="text-body-2" style="font-size: 14px">
                        Please choose at least one person to approve.
                    </div>
                </div>

                <!-- Button -->
                <VBtn
                color="primary"
                elevation="0"
                @click="addApprover"
                >
                <VIcon icon="tabler-user-plus" size="18" class="me-1" />
                Add Approver
                </VBtn>
            </div>

            <VRow 
              class="align-center"
              density="compact"
              no-gutters
              style="gap: 8px;"
            >
            <VCol cols="8" md="6" lg="4">
                <AppSelect
                    v-model="approvers[0].userID"
                    label="Approver 1"
                    placeholder="Select Approver"
                    :items="usersList"
                    item-title="title"
                    item-value="id"
                    clearable
                    :rules="[requiredValidator]"
                />
              </VCol>

              <VCol cols="auto" class="d-flex align-center">
                <VCheckbox
                    v-model="isInternalRecipientsEnable"
                    label="Print Signature"
                    density="compact"
                    hide-details
                    class="mt-5"
                />
              </VCol>                
            </VRow>

            <div v-for="(approver, index) in approvers">
              <VRow 
              class="align-center mt-2"
              v-if="index >= 1"
              density="compact"
              no-gutters
              style="gap: 8px;"
            >
                  <VCol cols="8" md="6" lg="4">
                    <AppSelect
                      class="tight-select"
                      v-model="approvers[index].userID"
                      :label="'Approver ' + (index + 1)"
                      :placeholder="'Select For Approver ' + (index + 1)"
                      :items="usersList"
                      item-title="title"
                      item-value="id"
                      clearable
                      style="width: 100%;"
                    />
                  </VCol>

                  <VCol cols="auto" class="d-flex align-center">
                    <VCheckbox
                      class="tight-checkbox mt-5"
                      v-model="approver.signature"
                      label="Print Signature"
                      density="compact"
                      hide-details
                    />
                  </VCol>

                  <VCol cols="auto">
                    <VBtn
                      class="tight-btn mt-5 ml-4"
                      icon="tabler-x"
                      variant="outlined"
                      color="error"
                      rounded
                      @click="removeApprover(index)"
                    />
                  </VCol>
              </VRow>
            </div>

            <VCol
              cols="12"
              class="d-flex flex-wrap gap-4 justify-end"
            >
              <VBtn
                :v-if="currentTab > 1"
                variant="outlined"
                @click="preTab"
              >
                Previous
                </VBtn>
                <VBtn
                    :disabled="currentTab === totalTabs"
                    color="primary"
                    variant="tonal"
                    style="width: 105px;"
                    @click="nextTab"
                >
                Next
              </VBtn>
            </VCol>
        </VWindowItem>

        <VWindowItem :value="4">
          <!-- Attachments Section -->
          <VCard class="mb-6" elevation="1">
            <VCardTitle class="text-h6 pa-4 bg-grey-lighten-5">
              Upload Supporting Documents
            </VCardTitle>
              <VCol cols="12">
                <div
                  class="file-upload-area mb-4 d-flex flex-column align-center justify-center"
                  :class="{ 'is-disabled': isLoaderVisible || isUploading }"
                  @click="onFileClick"
                  @dragover.prevent
                  @drop.prevent="onFileDrop"
                >
                  <VLabel class="text-body-1 font-weight-medium mb-2">
                    Select files to upload
                  </VLabel>
                  <div class="text-body-2 text-medium-emphasis mb-3">
                    Maximum file size: 2MB per file. Supported formats: PDF, JPG, PNG. You can select multiple files at once.
                  </div>

                  <VIcon size="48" color="primary">tabler-upload</VIcon>
                  <div class="text-body-2 text-medium-emphasis mt-2">
                    Click or drag files here to upload
                  </div>

                  <input
                    ref="fileInput"
                    type="file"
                    multiple
                    :accept="allowedFileType"
                    style="display: none;"
                    @change="onFileChange"
                    :disabled="isLoaderVisible"
                  />
                </div>

                <!-- Preview of selected files -->
                <div class="file-list" v-for="(file, index) in uploadingFiles"
                    :key="index">
                    <FileRowView
                      :file-name="file.name"
                      :file-size="formatFileSize(file.size)"
                      :file-type="null"
                      :file="file"
                      :index="index"
                      :onFileRemoved="onFileRemoved"
                    />
                </div>
              </VCol>

              <!-- Loading State -->
              <VRow v-if="isUploading" class="mt-4">
                <VCol cols="12">
                  <div class="text-center py-8">
                    <VProgressCircular
                      indeterminate
                      color="primary"
                      size="64"
                      width="6"
                      class="mb-4"
                    />
                    <div class="text-body-1 text-medium-emphasis mb-2">
                      Uploading {{ uploadingFiles.length }} file{{ uploadingFiles.length > 1 ? 's' : '' }}...
                    </div>
                    <div class="text-body-2 text-medium-emphasis">
                      Please wait while we process your files
                    </div>
                  </div>
                </VCol>
              </VRow>
          </VCard>

          <!-- Navigation -->
          <VRow>
            <VCol cols="12" class="d-flex flex-wrap gap-4 justify-end">
              <VBtn
                v-if="currentTab > 1"
                variant="outlined"
                @click="preTab"
              >
                Previous
              </VBtn>
              <VBtn
                :disabled="currentTab === totalTabs"
                color="primary"
                variant="tonal"
                style="width: 105px;"
                @click="nextTab"
              >
                Next
              </VBtn>
            </VCol>
          </VRow>
        </VWindowItem>

        <VWindowItem :value="5">
          <VAlert
          color="error"
          icon="tabler-alert-circle"
          variant="tonal"
          class="mb-5"
          v-if="isInvalidFormVisible"
          >
          Please review and complete all required fields in the form.
          </VAlert>
          <div>
              <VLabel style="font-size: 16px;font-weight: 500;">Select Preferred Letterhead. *</VLabel>
              <div class="text-body-2" style="font-size: 14px;">
                The letterhead will be displayed at the top of your letter.
              </div>
          </div>

          <CustomRadiosWithIcon
            v-model:selected-radio="selectedLetterheadType"
            :radio-content="documentLetterHeadType"
            :grid-column="{ sm: '6', cols: '12' }"
          />

          <VCol
                cols="12"
                class="d-flex flex-wrap gap-4 justify-end mt-3"
                >

                <VBtn
                    :v-if="currentTab > 1"
                    variant="outlined"
                    @click="preTab"
                >
                Previous
                </VBtn>

                <VSpacer/>

                <VBtn
                    :v-if="currentTab > 1"
                    color="secondary"
                    variant="outlined"
                    @click="saveAsDraft"
                >
                Save as a draft
                </VBtn>
                <VBtn
                  color="primary"
                  @click="showSubmitDialog"
                >
                Finish & send Letter
              </VBtn>
            </VCol>
        </VWindowItem>
      </VWindow>
    </VCardText>
    </VForm>
  </VCard>

  <VExpansionPanels
    v-model="previewPanel"
    class="expansion-panels-width-border mt-5"
  >
    <VExpansionPanel>
      <VExpansionPanelTitle 
      collapse-icon="tabler-minus"
      expand-icon="tabler-plus"
      >
      <p style="font-size: larger;">Document Preview</p>
      </VExpansionPanelTitle>
      <VExpansionPanelText>
          <A4PaperView 
            :document="document"
            :booking-number="bookingNumber"
            :internal-recipients="selectedInternalRecipients"
            :external-recipients="document.externalRecipient"
            :signers="signers"
            :with-letter-head="selectedLetterheadType == '2' ? true : false"
          />
      </VExpansionPanelText>
    </VExpansionPanel>
  </VExpansionPanels>

  <!-- DIALOG -->
  <VDialog
    v-model="isDialogVisible"
    persistent
    class="v-dialog-sm"
  >
    <!-- Dialog close btn -->
  <DialogCloseBtn @click="isDialogVisible = !isDialogVisible" />

    <!-- Dialog Content -->
    <VCard title="Confirm Submission Approval">
      <VCardText>
        Are you sure all the inputted data are correct?
      </VCardText>

      <VCardText class="d-flex justify-end gap-3 flex-wrap">
        <VBtn
          color="primary"
          variant="outlined"
          @click="isDialogVisible = false"
        >
          Cancel
        </VBtn>
        <VBtn @click="sendDocument">
          Yes, Send Letter
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>

  <!-- Dialog -->
  <VDialog
    v-model="isLoaderVisible"
    width="300"
  >
    <VCard
      color="primary"
      width="300"
    >
      <VCardText class="pt-3" style="text-align: center;">
        In Progress Generating Your Document...
        <VProgressLinear
          indeterminate
          bg-color="rgba(var(--v-theme-surface), 0.1)"
          :height="8"
          class="mb-0 mt-4"
        />
      </VCardText>
    </VCard>
  </VDialog>

    <!-- Dialog -->
    <VDialog
    v-model="isSuccessDialogVisible"
    width="500"
  >
    <VCard
      color="success"
      width="500"
      class="align-center"
    >
      <VIcon
          icon="tabler-circle-dashed-check"
          color="white"
          style="width: 100px; height: 100px;"
      />
      <VCardText style="font-weight: bold; text-align: center; font-size: 20px;">
        Your Document Successfully Distributed.
      </VCardText>
    </VCard>
  </VDialog>

  <VDialog
    v-model="isSuccessSaveAsDraftDialogVisible"
    width="500"
  >
    <VCard
      color="success"
      width="500"
      class="align-center"
    >
      <VIcon
          icon="tabler-circle-dashed-check"
          color="white"
          style="width: 100px; height: 100px;"
      />
      <VCardText style="font-weight: bold; text-align: center; font-size: 20px;">
        Your Document Successfully Saved as a Draft.
      </VCardText>
    </VCard>
  </VDialog>

  <!-- Delete Confirmation Dialog -->
  <VDialog
    v-model="deleteDialogVisible"
    max-width="400"
  >
    <VCard>
      <VCardTitle class="text-h6">
        <VIcon icon="tabler-alert-triangle" color="warning" class="me-2" />
        Confirm Delete
      </VCardTitle>
      
      <VCardText>
        Are you sure you want to delete this file? This action cannot be undone.
      </VCardText>
      
      <VCardActions class="justify-end">
        <VBtn
          color="grey"
          variant="text"
          @click="deleteDialogVisible = false"
        >
          Cancel
        </VBtn>
        <VBtn
          color="error"
          variant="flat"
          @click="deleteFile"
        >
          Delete
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style lang="scss">
// Optional custom adjustments
.tight-select {
  .v-input__control {
    min-height: 40px !important;
  }
}

.tight-checkbox {
  margin-top: 2px; // Fine-tune vertical alignment
  .v-label {
    white-space: nowrap;
  }
}

.tight-btn {
  height: 40px;
  width: 40px;
}

// Uploaded files container styling
.uploaded-files-container {
  border: 2px solid rgb(var(--v-theme-primary), 0.12) !important;
  border-radius: 12px !important;
  background: linear-gradient(145deg, 
    rgba(var(--v-theme-surface), 1), 
    rgba(var(--v-theme-primary), 0.02)
  );
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, 
      rgb(var(--v-theme-primary)), 
      rgb(var(--v-theme-secondary))
    );
  }
  
  &:hover {
    border-color: rgb(var(--v-theme-primary), 0.25) !important;
    box-shadow: 0 4px 20px rgba(var(--v-theme-primary), 0.1);
  }
}

.v-card {
  box-shadow: none !important;
}

// File card styling
.file-upload-area {
  border: 2px dashed rgba(var(--v-theme-on-surface), 0.2); // light dashed border
  border-radius: 12px; // match screenshot’s rounded corners
  padding: 2.5rem;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s, background-color 0.2s;
  background-color: transparent; // keep background clean
}

.file-upload-area:hover {
  border-color: rgba(var(--v-theme-primary), 0.4);
  background-color: rgba(var(--v-theme-primary), 0.02); // subtle hover background
}

.file-upload-area.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
}

/* Each row card */
.file-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: white;
  border-radius: 12px;
  padding: 0.75rem 1rem;
  box-shadow: 0 3px 4px rgba(16,24,40,0.04);
  border: 2px solid rgba(0,0,0,0.06);
}

/* left icon */
.file-left {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
}

.file-icon-img {
  width: 44px;
  height: 44px;
  object-fit: contain;
  border-radius: 8px; /* or 6px to match your style */
  background: transparent;
  user-select: none;
}

/* body (title + meta) */
.file-body {
  flex: 1 1 auto;
  min-width: 0; /* allow ellipsis */
}

.file-title {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* extension and size */
.file-meta {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.file-ext {
  background: rgba(0,0,0,0.04);
  padding: 0.125rem 0.5rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.75rem;
  color: #374151;
}

/* action buttons on right */
.file-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

/* round outlined icon buttons */
.action-btn {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  min-width: 40px;
  display: grid;
  place-items: center;
  box-shadow: none;
}

/* small separator dot */
.dot {
  opacity: 0.6;
}

/* responsiveness: on small screens reduce padding */
@media (max-width: 420px) {
  .file-row {
    padding: 0.5rem;
  }
  .file-title {
    font-size: 0.95rem;
  }
}
</style>
