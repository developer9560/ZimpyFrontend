export type AttributeType = 'TEXT' | 'NUMBER' | 'ENUM';

export interface Attribute {
    id: number;
    name: string;
    type: AttributeType;
    createdAt?: string;
    updatedAt?: string;
}

export interface AttributeValue {
    id: number;
    attribute?: Attribute;
    value: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface AttributeRequest {
    name: string;
    type: AttributeType;
}

export interface AttributeValueRequest {
    attributeId: number;
    value: string;
}

export interface AssignAttributeToSkuRequest {
    skuId: number;
    attributeValueIds: number[];
}
