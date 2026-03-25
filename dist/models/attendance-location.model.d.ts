export interface AttendanceLocation {
    id: number;
    name: string;
    location_coordinates: string;
    location_radius_meters: number;
    branch_id: number | null;
    is_active: boolean;
    created_by: number | null;
    created_at: Date;
    updated_at: Date;
}
export interface AttendanceLocationInput {
    name: string;
    location_coordinates: string;
    location_radius_meters?: number;
    branch_id?: number | null;
    is_active?: boolean;
    created_by?: number | null;
}
export interface AttendanceLocationUpdate {
    name?: string;
    location_coordinates?: string;
    location_radius_meters?: number;
    branch_id?: number | null;
    is_active?: boolean;
}
declare class AttendanceLocationModel {
    static tableName: string;
    static findAll(): Promise<AttendanceLocation[]>;
    static findById(id: number): Promise<AttendanceLocation | null>;
    static findActiveLocations(): Promise<AttendanceLocation[]>;
    static findByBranch(branchId: number): Promise<AttendanceLocation[]>;
    static create(locationData: AttendanceLocationInput): Promise<AttendanceLocation>;
    static update(id: number, locationData: AttendanceLocationUpdate): Promise<AttendanceLocation | null>;
    static delete(id: number): Promise<boolean>;
    static isWithinAttendanceLocation(lat: number, lng: number, branchId?: number | null): Promise<AttendanceLocation | null>;
    static getLocationsNearby(lat: number, lng: number, maxDistanceMeters?: number, branchId?: number | null): Promise<AttendanceLocation[]>;
    static isWithinSpecificLocation(locationId: number, lat: number, lng: number): Promise<boolean>;
    static findByActiveStatus(isActive: boolean): Promise<AttendanceLocation[]>;
}
export default AttendanceLocationModel;
//# sourceMappingURL=attendance-location.model.d.ts.map