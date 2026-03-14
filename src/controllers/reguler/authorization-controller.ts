import { Document } from '@/models/document/document'
import { computed, ref } from 'vue'

export function authorizationController() {
    const router = useRouter()
    const documents = ref<Document[]>([])
    const selected = ref<Document[]>([])
    const searchQuery = ref('')

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
    if (value === '1')
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
          const res = await useApi('/document/authorization', {
            method: 'GET'
          })
      
          console.log(res.data.value)
          const value = res.data.value as { data: any };
          documents.value = value.data.map((document: any) => mapDocument(document));
        } catch (e) {
          console.log(e)
        }
      }

      const onTapFilter = () => {
        filteredType.value = null
        filteredPriority.value = null
        filteredStatus.value = null
        isFilterSectionVisible.value = !isFilterSectionVisible.value
      }

      // Helper function to strip HTML tags and decode entities for plain text display
      const stripHtml = (html: string): string => {
        if (!html) return ''
        
        let text = html
        
        // Decode all possible HTML entities multiple times
        for (let iteration = 0; iteration < 5; iteration++) {
          let hasChanged = false
          
          // Manual entity replacement (case insensitive)
          const entityReplacements: Array<[RegExp, string]> = [
            [/&amp;/gi, '&'],
            [/&lt;/gi, '<'],
            [/&gt;/gi, '>'],
            [/&quot;/gi, '"'],
            [/&#0*34;/gi, '"'],
            [/&#x0*22;/gi, '"'],
            [/&#0*39;/gi, "'"],
            [/&apos;/gi, "'"],
            [/&#x0*27;/gi, "'"],
            [/&#0*47;/gi, '/'],
            [/&#x0*2F;/gi, '/'],
            [/&sol;/gi, '/'],
            [/&#0*92;/gi, '\\'],
            [/&#x0*5C;/gi, '\\'],
            [/&#0*124;/gi, '|'],
            [/&#x0*7C;/gi, '|'],
            [/&verbar;/gi, '|'],
            [/&#0*37;/gi, '%'],
            [/&#x0*25;/gi, '%'],
            [/&percnt;/gi, '%'],
            [/&nbsp;/gi, ' '],
          ]
          
          for (const [pattern, replacement] of entityReplacements) {
            const before = text
            text = text.replace(pattern, replacement as string)
            if (text !== before) hasChanged = true
          }
          
          // Generic numeric entities
          const beforeNumeric = text
          text = text.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(parseInt(dec)))
          text = text.replace(/&#x([0-9A-Fa-f]+);/gi, (match, hex) => String.fromCharCode(parseInt(hex, 16)))
          if (text !== beforeNumeric) hasChanged = true
          
          // DOM-based decoding
          const tmp = window.document.createElement('DIV')
          tmp.innerHTML = text
          const decoded = tmp.textContent || tmp.innerText || ''
          if (decoded !== text) hasChanged = true
          text = decoded
          
          // If nothing changed, we're done
          if (!hasChanged) break
        }
        
        // Remove any remaining < > brackets (for safety)
        text = text.replace(/[<>]/g, '')
        
        // Clean up whitespace
        text = text.replace(/\s+/g, ' ').trim()
        
        return text
      }

      // Helper function to decode HTML entities for v-html rendering
      const decodeHtml = (html: string): string => {
        if (!html) return ''
        
        const txt = window.document.createElement('textarea')
        txt.innerHTML = html
        return txt.value
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

      onMounted(async () => {
        await fetchDocuments()
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
        stripHtml,
        decodeHtml,
        onTapFilter,
        fetchDocuments,
        onTapRow
      }
}
