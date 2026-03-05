import { CustomInputContent } from "@/@core/types";

export const documentType: CustomInputContent[] = [
  {
    title: 'Internal',
    desc: 'A Document Created for Internal Purpose (Announcement, Permit, etc).',
    value: '1',
  },
  {
    title: 'External',
    value: '2',
    desc: 'A Document Created for External Purpose and It Will Send to Other Company',
  },
]

export const documentLetterHeadType: CustomInputContent[] = [
  {
    title: 'No Letterhead',
    desc: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry',
    value: '1',
    icon: { icon: 'tabler-layout-navbar-inactive', size: '28' },
  },
  {
    title: 'With Letterhead',
    desc: 'It is a long established fact that a reader will be distracted by the readable content',
    value: '2',
    icon: { icon: 'tabler-layout-navbar', size: '28' },
  },
]

export const documentTabs = ['Header', 'Body', 'Approver', 'Attachment', 'Letterhead']

export const documentPriorityType = ref([
    { value: 1, title: 'High' },
    { value: 2, title: 'Medium' },
    { value: 3, title: 'Low' },
])

export const documentPublicationNumberTypes = ref([
    { value: 1, title: 'Auto-Generated' },
    { value: 2, title: 'Booked Number' },
    { value: 3, title: 'Manual' },
    { value: 4, title: 'N/A (No Number)' },
])
