import { BookedDocumentNumber } from "@/models/document-number/document-number";
import { GroupWithFormats } from "@/models/document-number/group.with.format";
import { Attachments } from "@/models/document/document";
import { DocumentReference } from "@/models/document/reference.document";
import { Position } from "@/models/positions/position";
import { User } from "@/models/users/users";

export const mapUser = (rawUser: any): User => {
        return {
          ...rawUser,
          // override the position property with our mapped version
          position: mapPosition(rawUser.position),
          title: `${rawUser.firstName} ${rawUser.lastName} - ${mapPosition(rawUser.position).name}`
        };
      };


export const mapPosition = (rawPosition: any): Position => {
        return {
          id: rawPosition.ID,     // mapping 'ID' from response to 'id'
          name: rawPosition.Name  // mapping 'Name' from response to 'name'
    };
};
 
export function mapToAttachments(apiResponse: any[]): Attachments[] {
  return apiResponse.map(item => ({
    id: item.id,
    fileName: item.fileName,
    originalName: item.originalName, // key rename
    path: item.path,
    size: item.size,
    type: item.type
  }));
}

export const mapGroupedWithFormat = (raw: any): GroupWithFormats => {
        return {
          group: raw.group,
          formats: raw.formats.map((f: any) => ({
            id: f.id,
            name: f.name,
          })),
        };
      };

export const mapBookingNumber = (rawBookingNumber: any): BookedDocumentNumber => {
  return {
    id: rawBookingNumber.id,
    DocumentNumber: rawBookingNumber.documentNumber,
    FormatName: rawBookingNumber.numberingFormatName,
    GroupName: rawBookingNumber.numberingGroupName,
    CreatedAt: rawBookingNumber.createdAt,
  };
};

export const mapDocumentReference = (raw: any): DocumentReference => {
  return {
    id: raw.id,
    title: raw.subject
  }
};

      export const mapDocument = (rawDocuments: any): Document => {
        return {
          ...rawDocuments,
          // override the position property with our mapped version
          // position: mapPosition(rawUser.position)
        };
      };
