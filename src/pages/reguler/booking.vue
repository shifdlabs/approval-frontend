<script setup lang="ts">
import { BookedDocumentNumber } from '@/models/document-number/document-number'
import { GroupWithFormats } from '@/models/document-number/group.with.format'

const searchQuery = ref('')
const isBookingDocumentNumberDialogVisible = ref(false)
const isRefetchList = ref(false)
const bookedNumbers = ref<BookedDocumentNumber[]>([])
const groupedWithFormat = ref<GroupWithFormats[]>([])
const headers = [
    { title: 'DOCUMENT NUMBER', key: 'DocumentNumber' },
    { title: 'FORMAT NAME', key: 'FormatName' },
    { title: 'GROUP', key: 'GroupName' },
    { title: 'CREATED AT', key: 'CreatedAt' },
]

const onTapFilter = () => {
}

      const fetchBookedNumbers = async () => {
        try {
          const res = await useApi('/document/number/user', {
            method: 'GET'
          })
      
          console.log(res.data.value)
          const value = res.data.value as { data: any };
          bookedNumbers.value = value.data.map((bookingNumbers: any) => mapBookingNumber(bookingNumbers));
        } catch (e) {
          console.log(e)
        }
      }

      const fetchNumberingFormat = async () => {
        try {
          const res = await useApi('/numbering/format/grouped', {
            method: 'GET'
          });

          console.log(res.data.value);

          // Properly type the response
          const value = res.data.value as { data: any[] };

          // Map the raw data into your GroupWithFormats[]
          groupedWithFormat.value = value.data.map(mapGroupedWithFormat);
        } catch (e) {
          console.log(e);
        }
      };

      const mapGroupedWithFormat = (raw: any): GroupWithFormats => {
        return {
          group: raw.group,
          formats: raw.formats.map((f: any) => ({
            id: f.id,
            name: f.name,
          })),
        };
      };

      onMounted(() => {
        fetchBookedNumbers()
        fetchNumberingFormat()
      })

      const refetchList = async () => {
        if (isRefetchList) {
          fetchBookedNumbers()
          fetchNumberingFormat()
        }
      }



const mapBookingNumber = (rawBookingNumber: any): BookedDocumentNumber => {
  return {
    id: rawBookingNumber.id,
    DocumentNumber: rawBookingNumber.documentNumber,
    FormatName: rawBookingNumber.numberingFormatName,
    GroupName: rawBookingNumber.numberingGroupName,
    CreatedAt: rawBookingNumber.createdAt,
  };
};

    const filteredBookingNumber = computed(() => {
        return bookedNumbers.value.filter(number => {
          const subject = number.DocumentNumber.toLowerCase()

          const nameMatch =
            !searchQuery.value ||
            subject.includes(searchQuery.value.toLowerCase())

          // Both conditions must be true:
          return nameMatch
        })
      })

      function onTapRow(
        e: MouseEvent,
        payload: { item: Document; index: number; event: MouseEvent }
      ): void {
        const { item, index } = payload
        // router.replace('/preview/' + item.id)
        console.log('row clicked:', item, 'at index', index)
        // …etc.
      }


      function formatDate(input: string): string {
        const date = new Date(input);
      
        // Get each date component and pad with zero if needed
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        const seconds = date.getSeconds().toString().padStart(2, "0");
      
        // Construct the formatted date string
        return `${month}/${day}/${year}, ${hours}:${minutes}:${seconds}`;
      }
</script>
<template>
  <div>
    <VCard>
      <VCardText>
        <div class="d-flex justify-end flex-wrap gap-y-4 gap-x-6">
          <div class="d-flex align-center flex-wrap">
            <AppTextField
              v-model="searchQuery"
              placeholder="Search Booked Format"
              style="inline-size: 200px; width: 500px;"
              class="me-3"
            />
          </div>
 
          <VSpacer />
          <div class="d-flex align-center flex-wrap gap-4">
            <VBtn prepend-icon="tabler-plus" @click="isBookingDocumentNumberDialogVisible = true">
              Create New Booking
            </VBtn>
          </div>
        </div>
      </VCardText>

      <div>
        <VDataTable
          :headers="headers"
          :items="bookedNumbers"
          :items-per-page="10"
          @click:row="onTapRow"
        >
          <template #item.DocumentNumber="{ item }">
            <VLabel>
                {{ item.DocumentNumber }}
            </VLabel>
          </template>

          <template #item.FormatName="{ item }">
            <VLabel>
                {{ item.FormatName }}
            </VLabel>
          </template>

          <template #item.GroupName="{ item }">
            <VLabel>
                {{ item.GroupName }}
            </VLabel>
          </template>

          <template #item.CreatedAt="{ item }">
            <VLabel>
                {{ formatDate(item.CreatedAt)  }}
            </VLabel>
          </template>

        </VDataTable>
      </div>
    </VCard>
  </div>

  <BookingDocumentNumberDialog
    v-model:isDialogVisible="isBookingDocumentNumberDialogVisible"
    :data="groupedWithFormat"
    v-model:is-refetch-list="isRefetchList"
    @update:isRefetchList="refetchList"/>
</template>
