export const FormatCellType = {
  Number: { key: "{N}", name: "Number", short: "N", description: "Auto Increment Number" },
  Static: { key: "{S}", name: "Static", short: "S", description: "" },
  MonthNumber: { key: "{MN}", name: "Month Number", short: "M", description: "Auto Selected Based on Document Number Creation Date"},
  MonthRoman: { key: "{MR}", name: "Month Roman", short: "M", description: "Auto Selected Based on Document Number Creation Date" },
  Year: { key: "{Y}", name: "Year", short: "Y", description: "Auto Selected Based on Document Number Creation Date" },
} as const;

export type FormatCellTypeValue = typeof FormatCellType[keyof typeof FormatCellType];
