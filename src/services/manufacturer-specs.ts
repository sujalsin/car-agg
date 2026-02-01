import axios from 'axios';

const NHTSA_BASE = 'https://vpic.nhtsa.dot.gov/api/vehicles';

// All spec fields returned by NHTSA VIN decode, organized by category
export interface ManufacturerSpecs {
    // Overview
    make: string;
    model: string;
    year: number;
    trim: string;
    series: string;
    bodyClass: string;
    vehicleType: string;

    // Engine & Performance
    engineCylinders: number | null;
    engineDisplacementL: number | null;
    engineConfiguration: string;
    engineHP: number | null;
    engineKW: number | null;
    fuelType: string;
    fuelTypeSecondary: string;
    turbocharger: boolean;
    supercharger: boolean;

    // Transmission & Drivetrain
    transmissionStyle: string;
    transmissionSpeeds: number | null;
    driveType: string;

    // Dimensions & Weight
    doors: number | null;
    wheelbaseInches: number | null;
    trackWidthInches: number | null;
    overallLengthInches: number | null;
    overallWidthInches: number | null;
    overallHeightInches: number | null;
    curbWeightLbs: number | null;
    gvwrLbs: string;
    bedLengthInches: number | null;
    bedType: string;
    cabType: string;

    // Seating & Interior
    seats: number | null;
    seatRows: number | null;
    windows: number | null;

    // Safety Features (Standard/Optional/Not Available)
    abs: string;
    esc: string;
    tractionControl: string;
    forwardCollisionWarning: string;
    laneDepartureWarning: string;
    laneKeepAssist: string;
    adaptiveCruiseControl: string;
    automaticEmergencyBraking: string;
    blindSpotMonitoring: string;
    rearCamera: string;
    parkAssist: string;

    // Airbags
    frontAirbags: string;
    sideAirbags: string;
    curtainAirbags: string;
    kneeAirbags: string;
    seatCushionAirbags: string;

    // Electric Vehicle
    electrificationLevel: string;
    evDriveUnit: string;
    batteryKWh: number | null;
    chargerLevel: string;
    chargerPowerKW: number | null;

    // Manufacturing
    manufacturer: string;
    plantCountry: string;
    plantCity: string;
    plantCompanyName: string;

    // Other
    basePrice: number | null;
    destinationMarket: string;
    steeringLocation: string;
    entertainmentSystem: string;

    // Raw data for any other fields
    raw: Record<string, string>;
}

// Parse NHTSA VIN decode response into structured specs
function parseNHTSAResponse(data: Record<string, string>): ManufacturerSpecs {
    const getNum = (key: string): number | null => {
        const val = data[key];
        if (!val || val === 'Not Applicable') return null;
        const num = parseFloat(val);
        return isNaN(num) ? null : num;
    };

    const getStr = (key: string): string => {
        const val = data[key];
        return (val && val !== 'Not Applicable') ? val : '';
    };

    const getBool = (key: string): boolean => {
        const val = data[key];
        return val === 'Y' || val === 'Yes' || val === 'Standard';
    };

    return {
        // Overview
        make: getStr('Make'),
        model: getStr('Model'),
        year: getNum('ModelYear') || 0,
        trim: getStr('Trim') || getStr('Trim2'),
        series: getStr('Series') || getStr('Series2'),
        bodyClass: getStr('BodyClass'),
        vehicleType: getStr('VehicleType'),

        // Engine & Performance
        engineCylinders: getNum('EngineCylinders'),
        engineDisplacementL: getNum('DisplacementL'),
        engineConfiguration: getStr('EngineConfiguration'),
        engineHP: getNum('EngineHP'),
        engineKW: getNum('EngineKW'),
        fuelType: getStr('FuelTypePrimary') || getStr('FuelType'),
        fuelTypeSecondary: getStr('FuelTypeSecondary'),
        turbocharger: getBool('Turbo'),
        supercharger: getBool('Supercharger'),

        // Transmission & Drivetrain
        transmissionStyle: getStr('TransmissionStyle'),
        transmissionSpeeds: getNum('TransmissionSpeeds'),
        driveType: getStr('DriveType'),

        // Dimensions & Weight
        doors: getNum('Doors'),
        wheelbaseInches: getNum('WheelBaseShort') || getNum('WheelBaseLong'),
        trackWidthInches: getNum('TrackWidth'),
        overallLengthInches: getNum('OverallLength') || getNum('Length'),
        overallWidthInches: getNum('OverallWidth') || getNum('Width'),
        overallHeightInches: getNum('OverallHeight') || getNum('Height'),
        curbWeightLbs: getNum('CurbWeightLB'),
        gvwrLbs: getStr('GVWR'),
        bedLengthInches: getNum('BedLength'),
        bedType: getStr('BedType'),
        cabType: getStr('CabType'),

        // Seating & Interior
        seats: getNum('Seats'),
        seatRows: getNum('SeatRows'),
        windows: getNum('Windows'),

        // Safety Features
        abs: getStr('ABS'),
        esc: getStr('ESC'),
        tractionControl: getStr('TractionControl'),
        forwardCollisionWarning: getStr('ForwardCollisionWarning'),
        laneDepartureWarning: getStr('LaneDepartureWarning'),
        laneKeepAssist: getStr('LaneKeepSystem'),
        adaptiveCruiseControl: getStr('AdaptiveCruiseControl'),
        automaticEmergencyBraking: getStr('CIB'),
        blindSpotMonitoring: getStr('BlindSpotMon'),
        rearCamera: getStr('RearVisibilitySystem'),
        parkAssist: getStr('ParkAssist'),

        // Airbags
        frontAirbags: getStr('AirBagLocFront'),
        sideAirbags: getStr('AirBagLocSide'),
        curtainAirbags: getStr('AirBagLocCurtain'),
        kneeAirbags: getStr('AirBagLocKnee'),
        seatCushionAirbags: getStr('AirBagLocSeatCushion'),

        // Electric Vehicle
        electrificationLevel: getStr('ElectrificationLevel'),
        evDriveUnit: getStr('EVDriveUnit'),
        batteryKWh: getNum('BatteryKWh'),
        chargerLevel: getStr('ChargerLevel'),
        chargerPowerKW: getNum('ChargerPowerKW'),

        // Manufacturing
        manufacturer: getStr('Manufacturer'),
        plantCountry: getStr('PlantCountry'),
        plantCity: getStr('PlantCity'),
        plantCompanyName: getStr('PlantCompanyName'),

        // Other
        basePrice: getNum('BasePrice'),
        destinationMarket: getStr('DestinationMarket'),
        steeringLocation: getStr('SteeringLocation'),
        entertainmentSystem: getStr('EntertainmentSystem'),

        // Keep raw data for anything we missed
        raw: data,
    };
}

// Decode VIN for comprehensive specs
export async function getSpecsFromVIN(vin: string): Promise<ManufacturerSpecs | null> {
    try {
        const response = await axios.get(
            `${NHTSA_BASE}/DecodeVinValues/${vin}?format=json`
        );

        const result = response.data.Results?.[0];
        if (!result) return null;

        // Filter out empty values
        const data: Record<string, string> = {};
        for (const [key, value] of Object.entries(result)) {
            if (value && typeof value === 'string' && value.trim() !== '') {
                data[key] = value.trim();
            }
        }

        return parseNHTSAResponse(data);
    } catch (error) {
        console.error('Error decoding VIN for specs:', error);
        return null;
    }
}

// Get all WMIs (World Manufacturer Identifiers) for a make
export async function getWMIsForMake(make: string): Promise<string[]> {
    try {
        const response = await axios.get(
            `${NHTSA_BASE}/GetWMIsForManufacturer/${encodeURIComponent(make)}?format=json`
        );

        return (response.data.Results || [])
            .filter((r: any) => r.VehicleType === 'Passenger Car' || r.VehicleType === 'Multipurpose Passenger Vehicle (MPV)')
            .map((r: any) => r.WMI)
            .slice(0, 5); // Limit to 5 WMIs
    } catch (error) {
        console.error('Error getting WMIs:', error);
        return [];
    }
}

// Sample VINs for common vehicles to pre-decode specs
export const SAMPLE_VINS: Record<string, Record<string, Record<string, string>>> = {
    // Format: make -> model -> year -> sample VIN
    'Honda': {
        'Civic': {
            '2024': '19XFL1H72RE000000',
            '2023': '19XFL1H72RE000000',
        },
        'Accord': {
            '2024': '1HGCY2F53RA000000',
            '2023': '1HGCY2F53RA000000',
        },
        'CR-V': {
            '2024': '7FARS4H50RE000000',
            '2023': '7FARS4H50RE000000',
        },
    },
    'Toyota': {
        'Camry': {
            '2024': '4T1C11AK3RU000000',
            '2023': '4T1C11AK3RU000000',
        },
        'Corolla': {
            '2024': '5YFS4MCE3RP000000',
            '2023': 'JTDS4MCE3PJ000000',
        },
        'RAV4': {
            '2024': '2T3P1RFV3RC000000',
            '2023': '2T3P1RFV3RC000000',
        },
    },
    'Ford': {
        'F-150': {
            '2024': '1FTEW1EP4RFA00000',
            '2023': '1FTEW1EP4RFA00000',
        },
        'Mustang': {
            '2024': '1FA6P8CF3R5000000',
            '2023': '1FA6P8CF3R5000000',
        },
    },
    'BMW': {
        '3 Series': {
            '2024': 'WBA23AP07RCK00000',
            '2023': 'WBA23AP07RCK00000',
        },
        'X5': {
            '2024': '5UX23EM02R9S00000',
            '2023': '5UX23EM02R9S00000',
        },
    },
    'Audi': {
        'A4': {
            '2024': 'WAUDNAF43RN000000',
            '2023': 'WAUDNAF43RN000000',
        },
        'A5': {
            '2024': 'WAUWACF56RA000000',
            '2023': 'WAUWACF56RA000000',
        },
        'Q5': {
            '2024': 'WA1BNAFY2R2000000',
            '2023': 'WA1BNAFY2R2000000',
        },
    },
    'Mercedes-Benz': {
        'C-Class': {
            '2024': 'W1KZF4KB4RA000000',
            '2023': 'W1KZF4KB4RA000000',
        },
        'E-Class': {
            '2024': 'W1KZF8DB0RA000000',
            '2023': 'W1KZF8DB0RA000000',
        },
    },
    'Chevrolet': {
        'Silverado': {
            '2024': '3GCUDEED3RG000000',
            '2023': '3GCUDEED3RG000000',
        },
        'Equinox': {
            '2024': '3GNAXUEV7RS000000',
            '2023': '3GNAXUEV7RS000000',
        },
    },
    'Tesla': {
        'Model 3': {
            '2024': '5YJ3E1EA0RF000000',
            '2023': '5YJ3E1EA0RF000000',
        },
        'Model Y': {
            '2024': '7SAYGDEE0RF000000',
            '2023': '7SAYGDEE0RF000000',
        },
    },
};

// Format spec value for display
export function formatSpecValue(key: string, value: any): string {
    if (value === null || value === undefined || value === '') return '—';

    // Boolean values
    if (typeof value === 'boolean') return value ? '✓' : '—';

    // Safety feature values
    if (value === 'Standard') return '✓ Standard';
    if (value === 'Optional') return '○ Optional';

    // Numeric with units
    if (typeof value === 'number') {
        if (key.includes('HP') || key === 'engineHP') return `${value} hp`;
        if (key.includes('KW') || key === 'engineKW') return `${value} kW`;
        if (key.includes('L') || key === 'engineDisplacementL') return `${value}L`;
        if (key.includes('Lbs') || key.includes('Weight')) return `${value.toLocaleString()} lbs`;
        if (key.includes('Inches') || key.includes('Length') || key.includes('Width') || key.includes('Height')) return `${value}"`;
        if (key.includes('kWh') || key === 'batteryKWh') return `${value} kWh`;
        return value.toString();
    }

    return String(value);
}

// Categories for display
export const SPEC_CATEGORIES = {
    'Engine & Performance': [
        'engineCylinders', 'engineDisplacementL', 'engineConfiguration',
        'engineHP', 'engineKW', 'fuelType', 'turbocharger', 'supercharger'
    ],
    'Transmission & Drivetrain': [
        'transmissionStyle', 'transmissionSpeeds', 'driveType'
    ],
    'Dimensions': [
        'doors', 'wheelbaseInches', 'overallLengthInches', 'overallWidthInches',
        'overallHeightInches', 'trackWidthInches', 'curbWeightLbs'
    ],
    'Interior': [
        'seats', 'seatRows', 'windows', 'steeringLocation'
    ],
    'Safety Technology': [
        'forwardCollisionWarning', 'laneDepartureWarning', 'laneKeepAssist',
        'adaptiveCruiseControl', 'automaticEmergencyBraking', 'blindSpotMonitoring',
        'rearCamera', 'parkAssist'
    ],
    'Safety Systems': [
        'abs', 'esc', 'tractionControl'
    ],
    'Airbags': [
        'frontAirbags', 'sideAirbags', 'curtainAirbags', 'kneeAirbags'
    ],
    'Electric/Hybrid': [
        'electrificationLevel', 'evDriveUnit', 'batteryKWh', 'chargerLevel', 'chargerPowerKW'
    ],
    'Manufacturing': [
        'manufacturer', 'plantCountry', 'plantCity'
    ],
};

// Human-readable labels
export const SPEC_LABELS: Record<string, string> = {
    engineCylinders: 'Cylinders',
    engineDisplacementL: 'Engine Size',
    engineConfiguration: 'Engine Type',
    engineHP: 'Horsepower',
    engineKW: 'Power',
    fuelType: 'Fuel Type',
    fuelTypeSecondary: 'Secondary Fuel',
    turbocharger: 'Turbocharged',
    supercharger: 'Supercharged',
    transmissionStyle: 'Transmission',
    transmissionSpeeds: 'Speeds',
    driveType: 'Drive Type',
    doors: 'Doors',
    wheelbaseInches: 'Wheelbase',
    trackWidthInches: 'Track Width',
    overallLengthInches: 'Length',
    overallWidthInches: 'Width',
    overallHeightInches: 'Height',
    curbWeightLbs: 'Curb Weight',
    gvwrLbs: 'GVWR',
    bedLengthInches: 'Bed Length',
    bedType: 'Bed Type',
    cabType: 'Cab Type',
    seats: 'Seating Capacity',
    seatRows: 'Seat Rows',
    windows: 'Windows',
    steeringLocation: 'Steering',
    abs: 'Anti-lock Brakes',
    esc: 'Stability Control',
    tractionControl: 'Traction Control',
    forwardCollisionWarning: 'Forward Collision Warning',
    laneDepartureWarning: 'Lane Departure Warning',
    laneKeepAssist: 'Lane Keep Assist',
    adaptiveCruiseControl: 'Adaptive Cruise Control',
    automaticEmergencyBraking: 'Auto Emergency Braking',
    blindSpotMonitoring: 'Blind Spot Monitor',
    rearCamera: 'Backup Camera',
    parkAssist: 'Park Assist',
    frontAirbags: 'Front Airbags',
    sideAirbags: 'Side Airbags',
    curtainAirbags: 'Curtain Airbags',
    kneeAirbags: 'Knee Airbags',
    seatCushionAirbags: 'Seat Cushion Airbags',
    electrificationLevel: 'Powertrain',
    evDriveUnit: 'EV Drive Unit',
    batteryKWh: 'Battery Capacity',
    chargerLevel: 'Charger Level',
    chargerPowerKW: 'Charger Power',
    manufacturer: 'Manufacturer',
    plantCountry: 'Country of Origin',
    plantCity: 'Assembly Plant',
    plantCompanyName: 'Plant Company',
    basePrice: 'Base MSRP',
    destinationMarket: 'Market',
};
