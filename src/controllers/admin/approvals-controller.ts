import { Document } from '@/models/document/document'
import { computed, ref } from 'vue'

export function approvalsController() {
    const stripHtml = (html: string): string => {
      if (!html) return ''
      
      let text = html
      
      // Decode HTML entities multiple times to handle nested encoding
      for (let i = 0; i < 5; i++) {
        const entities: { [key: string]: string } = {
          '&nbsp;': ' ',
          '&amp;': '&',
          '&lt;': '<',
          '&gt;': '>',
          '&quot;': '"',
          '&#39;': "'",
          '&#x27;': "'",
          '&apos;': "'",
          '&cent;': '¢',
          '&pound;': '£',
          '&yen;': '¥',
          '&euro;': '€',
          '&copy;': '©',
          '&reg;': '®',
          '&trade;': '™',
          '&times;': '×',
          '&divide;': '÷',
          '&laquo;': '«',
          '&raquo;': '»',
          '&ndash;': '–',
          '&mdash;': '—',
          '&hellip;': '…',
          '&permil;': '‰',
          '&bull;': '•',
          '&deg;': '°',
          '&para;': '¶',
          '&sect;': '§',
          '&ldquo;': '"',
          '&rdquo;': '"',
          '&lsquo;': "'",
          '&rsquo;': "'"
        }
        
        Object.keys(entities).forEach(entity => {
          const regex = new RegExp(entity, 'g')
          text = text.replace(regex, entities[entity])
        })
      }
      
      // Remove HTML tags using DOM
      const doc = new DOMParser().parseFromString(text, 'text/html')
      text = doc.body.textContent || ''
      
      // Clean up extra whitespace
      text = text.replace(/\s+/g, ' ').trim()
      
      return text
    }
    const documents = ref<Document[]>([])
    const selected = ref<Document[]>([])
    const searchQuery = ref('')
    const router = useRouter()

    const filteredType = ref(null)
    const filteredPriority = ref(null)
    const filteredStatus = ref(null)

    const isFilterSectionVisible = ref(false)
    const headers = [
    { title: 'SUBJECT', key: 'subject' },
    { title: 'BODY', key: 'body' },
    { title: 'TYPE', key: 'type' },
    { title: 'PRIORITY', key: 'priority' },
    { title: 'STATUS', key: 'status' },
    { title: 'UPDATED AT', key: 'updatedAt' },
    ]

    const priorityCard = (value: number | null) => {
    if (value === 1)
        return { color: 'error', text: 'High' }
    else if (value === 2)
        return { color: 'warning', text: 'Medium' }
    else
        return { color: 'primary', text: 'Low' }
    }

    const documentType = (value: string) => {
    if (value === "1")
        return "External"
    else 
        return "Internal"
    }

    const statusCard = (value: number) => {
    if (value === 1)
        return { color: 'warning', text: 'In Progress' }
    else if (value === 2)
        return { color: 'success', text: 'Finished' }
    else if (value === 3)
        return { color: 'secondary', text: 'Cancelled' }
    else if (value === 99)
        return { color: 'error', text: 'Rejected' }
    else
        return { color: 'info', text: '-' }
    }

    const documentTypeValue = ref([
    { value: 1, title: 'External' },
    { value: 2, title: 'Internal' },
    ])

    const priorityValue = ref([
    { value: 1, title: 'High' },
    { value: 2, title: 'Medium' },
    { value: 3, title: 'Low' },
    ])

    const statusValue = ref([
    { value: 1, title: 'In Progress' },
    { value: 2, title: 'Finished' },
    { value: 3, title: 'Cancelled' },
    { value: 99, title: 'Rejected' },
    ])

    const filteredDocument = computed(() => {
        return documents.value.filter(document => {
          const subject = document.subject.toLowerCase()
          const nameMatch =
            !searchQuery.value ||
            subject.includes(searchQuery.value.toLowerCase())
          const priorityMatch =
            !filteredPriority.value ||
            document.priority == filteredPriority.value
          
          const typeMatch = !filteredType.value || document.type == filteredType.value
          const statusMatch = !filteredStatus.value || document.status == filteredStatus.value
          // Both conditions must be true:
          return nameMatch && priorityMatch && typeMatch && statusMatch
        })
      })

      const fetchDocuments = async () => {
        try {
          const res = await useApi('/document', {
            method: 'GET'
          })
      
          console.log(res.data.value)
          const value = res.data.value as { data: any };
          documents.value = value.data.map((document: any) => mapDocument(document));
        } catch (e) {
          console.log(e)
        }
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

      const mapDocument = (rawDocuments: any): Document => {
        return {
          ...rawDocuments,
          // override the position property with our mapped version
          // position: mapPosition(rawUser.position)
        };
      };

      const onTapFilter = () => {
        filteredType.value = null
        filteredPriority.value = null
        filteredStatus.value = null
        isFilterSectionVisible.value = !isFilterSectionVisible.value
      }

      function onTapRow(
        e: MouseEvent,
        payload: { item: Document; index: number; event: MouseEvent }
      ): void {
        const { item, index } = payload
        router.replace('/preview/' + item.id)
        console.log('row clicked:', item.id, 'at index', index)
        // …etc.
      }

      onMounted(() => {
        fetchDocuments()
      })

      return {
        selected,
        searchQuery,
        filteredType,
        filteredPriority,
        filteredStatus,
        filteredDocument,
        isFilterSectionVisible,
        headers,
        documentTypeValue,
        priorityValue,
        statusValue,
        priorityCard,
        documentType,
        statusCard,
        formatDate,
        stripHtml,
        onTapFilter,
        fetchDocuments,
        onTapRow
      }
}
