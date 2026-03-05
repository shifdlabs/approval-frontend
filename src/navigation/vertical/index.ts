const role = Number(useCookie('role').value);

export default [
  ...(role === 1
    ? [
        { heading: "Main" },
        {
          title: 'Dashboard',
          to: { name: 'reguler-dashboard' },
          icon: { icon: 'tabler-home-2' },
        },
        {
          title: 'Inbox',
          to: { name: 'reguler-inbox' },
          icon: { icon: 'tabler-inbox' },
        },
        {
          title: 'Starred',
          to: { name: 'reguler-bookmark' },
          icon: { icon: 'tabler-star' },
        },
        {
          title: 'Booking Number',
          to: { name: 'reguler-booking' },
          icon: { icon: 'tabler-sort-descending-2' },
        },
        { heading: "Indexes" },
        {
          title: 'Authorization',
          to: { name: 'reguler-authorization' },
          icon: { icon: 'tabler-clipboard-check' },
        },
        {
          title: 'In Progress',
          to: { name: 'reguler-progress' },
          icon: { icon: 'tabler-mail-up' },
        },
         {
          title: 'Draft',
          to: { name: 'reguler-draft' },
          icon: { icon: 'tabler-file-description' },
        },
        {
          title: 'Rejected',
          to: { name: 'reguler-rejected' },
          icon: { icon: 'tabler-mail-x' },
        },
        {
          title: 'Complete',
          to: { name: 'reguler-complete' },
          icon: { icon: 'tabler-mail-check' },
        }
      ]
    : role === 99
    ? [
        { heading: "Indexes" },
        {
          title: 'Users',
          to: { name: 'admin-users' },
          icon: { icon: 'tabler-users-group' },
        },
        {
          title: 'Job Positions',
          to: { name: 'admin-positions' },
          icon: { icon: 'tabler-subtask' },
        },
        {
          title: 'All Documents',
          to: { name: 'admin-approvals' },
          icon: { icon: 'tabler-mail' },
        },
        {
          title: 'Action Histories',
          to: { name: 'admin-histories' },
          icon: { icon: 'tabler-history' },
        },
        { heading: "System Settings" },
        {
          title: 'Document Numbers',
          to: { name: 'admin-document-numbers' },
          icon: { icon: 'tabler-sort-descending-2' },
        },
        {
          title: 'Letterhead',
          to: { name: 'admin-letterhead' },
          icon: { icon: 'tabler-mail-code' },
        },
        {
          title: 'App Logs',
          to: { name: 'admin-app-log' },
          icon: { icon: 'tabler-history-toggle' },
        },
        { heading: "Support" },
        {
          title: 'Contact Us',
          to: { name: 'admin-contactus' },
          icon: { icon: 'tabler-phone-call' },
        },
        // {
        //   title: 'Upload',
        //   to: { name: 'reguler-upload' },
        //   icon: { icon: 'tabler-cloud-upload' },
        // },
        // {
        //   title: 'Preview',
        //   to: { name: 'reguler-preview' },
        //   icon: { icon: 'tabler-eye' },
        // }
      ]
    : []), // Jika role tidak sesuai, tampilkan menu kosong
];
