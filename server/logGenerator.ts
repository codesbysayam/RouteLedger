/**
 * RouteLedger - ELD / RODS Daily Log Sheet Generator (TypeScript)
 * Maps day schedule events into FMCSA 49 CFR § 395.8 grid lines, remarks, and headers.
 */
import { DayPlan, ELDDailyLogSheet, ELDGraphSegment, CarrierInfo } from '../src/types.ts';

export function generateELDLogs(
  days: DayPlan[],
  carrierInfo?: Partial<CarrierInfo>
): ELDDailyLogSheet[] {
  const carrierName = carrierInfo?.carrier_name || 'Apex Freight Systems LLC';
  const mainOffice = carrierInfo?.main_office || '4200 Logistics Blvd, Richmond, VA 23230';
  const homeTerminal = carrierInfo?.home_terminal || 'Richmond Terminal, VA';
  const driverName = carrierInfo?.driver_name || 'John R. Miller';
  const vehicleNumber = carrierInfo?.vehicle_number || 'TRK-4089';
  const trailerNumber = carrierInfo?.trailer_number || 'TLR-8821';
  const shippingDoc = carrierInfo?.shipping_doc || 'BOL-77341 / Consumer Freight';
  const coDriver = carrierInfo?.co_driver || 'Solo Driver';

  return days.map((d) => {
    const graphSegments: ELDGraphSegment[] = [];

    for (const ev of d.events) {
      const dStart = new Date(ev.start_time);
      const dEnd = new Date(ev.end_time);

      const hStart = dStart.getUTCHours();
      const mStart = dStart.getUTCMinutes();
      const hEnd = dEnd.getUTCHours();
      const mEnd = dEnd.getUTCMinutes();

      const timeStartStr = `${String(hStart).padStart(2, '0')}:${String(mStart).padStart(2, '0')}`;
      let timeEndStr = `${String(hEnd).padStart(2, '0')}:${String(mEnd).padStart(2, '0')}`;

      let startFraction = (hStart + mStart / 60) / 24;
      let endFraction = (hEnd + mEnd / 60) / 24;

      if (endFraction === 0 && (hEnd !== hStart || mEnd !== mStart)) {
        endFraction = 1.0;
        timeEndStr = '24:00';
      }

      graphSegments.push({
        event_id: ev.id,
        duty_status: ev.duty_status,
        start_time: timeStartStr,
        end_time: timeEndStr,
        start_fraction: parseFloat(startFraction.toFixed(4)),
        end_fraction: parseFloat(endFraction.toFixed(4)),
        duration_hours: ev.duration_hours,
        location_name: ev.location_name,
        description: ev.description,
      });
    }

    return {
      day_number: d.day_number,
      date: d.date,
      carrier_name: carrierName,
      main_office_address: mainOffice,
      home_terminal_address: homeTerminal,
      driver_name: driverName,
      co_driver: coDriver,
      truck_tractor_number: vehicleNumber,
      trailer_number: trailerNumber,
      shipping_documents: shippingDoc,
      total_miles_driving_today: d.total_miles_driving_today,
      total_hours: d.total_hours,
      totals: {
        off_duty_hours: d.off_duty_hours,
        sleeper_berth_hours: d.sleeper_berth_hours,
        driving_hours: d.driving_hours,
        on_duty_not_driving_hours: d.on_duty_not_driving_hours,
        total_on_duty_hours: d.total_on_duty_hours,
      },
      graph_segments: graphSegments,
      remarks: d.remarks,
      certified: true,
      certification_statement: `I hereby certify that my data entries and my record of duty status for ${d.date} are true and correct. — ${driverName}`,
    };
  });
}
