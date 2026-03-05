export interface Format {
  id: string;
  name: string;
}

export interface GroupWithFormats {
  group: string;
  formats: Format[];
}
