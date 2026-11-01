// The first record from each patient in the user's supplied medicalRecords.js.
// This is a display sample; the solution imports the full starter dataset.
export const medicalRecordsSample = [
  {
    id: '1',
    data: [
      {
        id: 6,
        timestamp: 1568550058964,
        diagnosis: { id: 3, name: 'Pulmonary embolism', severity: 4 },
        vitals: {
          bloodPressureDiastole: 155,
          bloodPressureSystole: 90,
          pulse: 130,
          breathingRate: 29,
          bodyTemperature: 99.2,
        },
        doctor: { id: 2, name: 'Dr Arnold Bullock' },
        userId: 1,
        userName: 'John Oliver',
        userDob: '02-01-1986',
        meta: { height: 168, weight: 173 },
      },
    ],
  },
  {
    id: '2',
    data: [
      {
        id: 1,
        timestamp: 1565637002408,
        diagnosis: { id: 3, name: 'Pulmonary embolism', severity: 4 },
        vitals: {
          bloodPressureDiastole: 154,
          bloodPressureSystole: 91,
          pulse: 125,
          breathingRate: 32,
          bodyTemperature: 100,
        },
        doctor: { id: 2, name: 'Dr Arnold Bullock' },
        userId: 2,
        userName: 'Bob Martin',
        userDob: '14-09-1989',
        meta: { height: 174, weight: 172 },
      },
    ],
  },
  {
    id: '3',
    data: [
      {
        id: 9,
        timestamp: 1548036340751,
        diagnosis: { id: 3, name: 'Pulmonary embolism', severity: 4 },
        vitals: {
          bloodPressureDiastole: 147,
          bloodPressureSystole: 96,
          pulse: 130,
          breathingRate: 28,
          bodyTemperature: 101,
        },
        doctor: { id: 2, name: 'Dr Arnold Bullock' },
        userId: 3,
        userName: 'Helena Fernandez',
        userDob: '23-12-1987',
        meta: { height: 157, weight: 106 },
      },
    ],
  },
];
