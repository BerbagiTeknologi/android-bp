import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format, parseISO } from 'date-fns';

/**
 * Attendance Report Generator
 * Utility for generating attendance reports and statistics
 */
class AttendanceReportGenerator {
  /**
   * Generate attendance statistics
   * 
   * @param {Array} attendanceRecords - Array of attendance records
   * @param {Object} options - Options for statistics generation
   * @returns {Object} - Statistics report
   */
  static generateStatistics(attendanceRecords, options = {}) {
    if (!attendanceRecords || !Array.isArray(attendanceRecords) || attendanceRecords.length === 0) {
      return {
        total: 0,
        present: 0,
        late: 0,
        absent: 0,
        verified: 0,
        unverified: 0,
        attendanceRate: 0,
        verificationRate: 0
      };
    }
    
    // Count totals
    const total = attendanceRecords.length;
    const present = attendanceRecords.filter(record => record.absen === 'Ya').length;
    const late = attendanceRecords.filter(record => record.absen === 'Terlambat').length;
    const absent = total - present - late;
    const verified = attendanceRecords.filter(record => record.is_verified).length;
    const unverified = total - verified;
    
    // Calculate rates
    const presentRate = total > 0 ? (present / total) * 100 : 0;
    const lateRate = total > 0 ? (late / total) * 100 : 0;
    const attendanceRate = total > 0 ? ((present + late) / total) * 100 : 0;
    const verificationRate = total > 0 ? (verified / total) * 100 : 0;
    
    // Group by verification method if verifications are loaded
    let verificationMethods = {};
    attendanceRecords.forEach(record => {
      if (record.verifications && record.verifications.length > 0) {
        const method = record.verifications[0].verification_method;
        verificationMethods[method] = (verificationMethods[method] || 0) + 1;
      }
    });
    
    // Group by student if requested
    let studentStats = {};
    if (options.groupByStudent) {
      attendanceRecords.forEach(record => {
        if (record.absen_user && record.absen_user.anak) {
          const student = record.absen_user.anak;
          const id = student.id_anak;
          
          if (!studentStats[id]) {
            studentStats[id] = {
              id: id,
              name: student.full_name || student.name,
              total: 0,
              present: 0,
              late: 0,
              absent: 0,
              presentRate: 0,
              lateRate: 0,
              attendanceRate: 0
            };
          }
          
          studentStats[id].total += 1;
          if (record.absen === 'Ya') {
            studentStats[id].present += 1;
          } else if (record.absen === 'Terlambat') {
            studentStats[id].late += 1;
          } else {
            studentStats[id].absent += 1;
          }
          
          // Calculate rates
          studentStats[id].presentRate = (studentStats[id].present / studentStats[id].total) * 100;
          studentStats[id].lateRate = (studentStats[id].late / studentStats[id].total) * 100;
          studentStats[id].attendanceRate = ((studentStats[id].present + studentStats[id].late) / studentStats[id].total) * 100;
        }
      });
    }
    
    return {
      total,
      present,
      late,
      absent,
      verified,
      unverified,
      presentRate,
      lateRate,
      attendanceRate,
      verificationRate,
      verificationMethods,
      studentStats: Object.values(studentStats)
    };
  }
  
  /**
   * Generate a PDF report
   * 
   * @param {Array} attendanceRecords - Array of attendance records
   * @param {Object} stats - Statistics data
   * @param {Object} options - PDF generation options
   * @returns {Blob} - PDF file blob
   */
  static generatePdfReport(attendanceRecords, stats, options = {}) {
    const {
      title = 'Attendance Report',
      activityName = 'Activity',
      activityDate = '',
      startDate,
      endDate,
    } = options;
    
    // Create PDF document
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    
    // Add activity info
    doc.setFontSize(12);
    doc.text(`Activity: ${activityName}`, 14, 32);
    
    // Add date range if provided
    if (startDate && endDate) {
      doc.text(`Period: ${format(startDate, 'dd MMM yyyy')} - ${format(endDate, 'dd MMM yyyy')}`, 14, 38);
    } else if (activityDate) {
      doc.text(`Date: ${activityDate}`, 14, 38);
    }
    
    // Add statistics summary
    doc.setFontSize(14);
    doc.text('Attendance Statistics', 14, 48);
    
    // Create statistics table
    const statsData = [
      ['Total Records', stats.total.toString()],
      ['Present', `${stats.present} (${stats.presentRate.toFixed(1)}%)`],
      ['Late', `${stats.late} (${stats.lateRate.toFixed(1)}%)`],
      ['Absent', `${stats.absent} (${(100 - stats.attendanceRate).toFixed(1)}%)`],
      ['Total Attendance', `${stats.present + stats.late} (${stats.attendanceRate.toFixed(1)}%)`],
      ['Verified', `${stats.verified} (${stats.verificationRate.toFixed(1)}%)`],
      ['Unverified', `${stats.unverified} (${(100 - stats.verificationRate).toFixed(1)}%)`]
    ];
    
    doc.autoTable({
      startY: 52,
      head: [['Metric', 'Value']],
      body: statsData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] }
    });
    
    // Add verification methods if available
    if (stats.verificationMethods && Object.keys(stats.verificationMethods).length > 0) {
      const methodsData = Object.entries(stats.verificationMethods).map(([method, count]) => {
        const percentage = ((count / stats.total) * 100).toFixed(1);
        let displayMethod = method;
        
        // Format method name for display
        if (method === 'qr_code') displayMethod = 'QR Code';
        else if (method === 'face_recognition') displayMethod = 'Face Recognition';
        else if (method === 'dual') displayMethod = 'Dual Verification';
        else if (method === 'manual') displayMethod = 'Manual Verification';
        
        return [displayMethod, `${count} (${percentage}%)`];
      });
      
      const methodsY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(14);
      doc.text('Verification Methods', 14, methodsY);
      
      doc.autoTable({
        startY: methodsY + 4,
        head: [['Method', 'Count']],
        body: methodsData,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] }
      });
    }
    
    // Add student statistics if available
    if (stats.studentStats && stats.studentStats.length > 0) {
      const studentY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(14);
      doc.text('Student Attendance', 14, studentY);
      
      const studentData = stats.studentStats.map(student => [
        student.name,
        student.total.toString(),
        student.present.toString(),
        student.late.toString(),
        student.absent.toString(),
        `${student.attendanceRate.toFixed(1)}%`
      ]);
      
      doc.autoTable({
        startY: studentY + 4,
        head: [['Student', 'Total', 'Present', 'Late', 'Absent', 'Rate']],
        body: studentData,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] }
      });
    }
    
    // Add attendance records if requested
    if (options.includeRecords && attendanceRecords.length > 0) {
      const recordsY = doc.lastAutoTable.finalY + 10;
      
      // Check if we need a new page
      if (recordsY > 260) {
        doc.addPage();
        doc.setFontSize(14);
        doc.text('Attendance Records', 14, 20);
        
        // Prepare records data
        const recordsData = attendanceRecords.map(record => {
          const studentName = record.absen_user?.anak?.full_name || record.absen_user?.anak?.name || 'Unknown';
          let status = 'Absent';
          if (record.absen === 'Ya') status = 'Present';
          else if (record.absen === 'Terlambat') status = 'Late';
          
          const verified = record.is_verified ? 'Yes' : 'No';
          const verificationStatus = record.verification_status.charAt(0).toUpperCase() + record.verification_status.slice(1);
          const recordDate = record.aktivitas?.tanggal ? 
            format(parseISO(record.aktivitas.tanggal), 'dd/MM/yyyy') : 'N/A';
          const arrivalTime = record.time_arrived ?
            format(parseISO(record.time_arrived), 'HH:mm') : '-';
          
          return [
            studentName,
            status,
            arrivalTime,
            verified,
            verificationStatus,
            recordDate
          ];
        });
        
        doc.autoTable({
          startY: 24,
          head: [['Student', 'Status', 'Arrival', 'Verified', 'Verification', 'Date']],
          body: recordsData,
          theme: 'grid',
          headStyles: { fillColor: [41, 128, 185] },
          styles: { fontSize: 9 },
          columnStyles: {
            0: { cellWidth: 40 },
            1: { cellWidth: 20 },
            2: { cellWidth: 20 },
            3: { cellWidth: 20 },
            4: { cellWidth: 25 },
            5: { cellWidth: 25 }
          }
        });
      } else {
        doc.setFontSize(14);
        doc.text('Attendance Records', 14, recordsY);
        
        // Prepare records data
        const recordsData = attendanceRecords.map(record => {
          const studentName = record.absen_user?.anak?.full_name || record.absen_user?.anak?.name || 'Unknown';
          let status = 'Absent';
          if (record.absen === 'Ya') status = 'Present';
          else if (record.absen === 'Terlambat') status = 'Late';
          
          const verified = record.is_verified ? 'Yes' : 'No';
          const verificationStatus = record.verification_status.charAt(0).toUpperCase() + record.verification_status.slice(1);
          const recordDate = record.aktivitas?.tanggal ? 
            format(parseISO(record.aktivitas.tanggal), 'dd/MM/yyyy') : 'N/A';
          const arrivalTime = record.time_arrived ?
            format(parseISO(record.time_arrived), 'HH:mm') : '-';
          
          return [
            studentName,
            status,
            arrivalTime,
            verified,
            verificationStatus,
            recordDate
          ];
        });
        
        doc.autoTable({
          startY: recordsY + 4,
          head: [['Student', 'Status', 'Arrival', 'Verified', 'Verification', 'Date']],
          body: recordsData,
          theme: 'grid',
          headStyles: { fillColor: [41, 128, 185] },
          styles: { fontSize: 9 },
          columnStyles: {
            0: { cellWidth: 40 },
            1: { cellWidth: 20 },
            2: { cellWidth: 20 },
            3: { cellWidth: 20 },
            4: { cellWidth: 25 },
            5: { cellWidth: 25 }
          }
        });
      }
    }
    
    // Add generation timestamp at the bottom
    const timestamp = format(new Date(), 'dd/MM/yyyy HH:mm');
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generated on ${timestamp}`, 14, 290);
    
    // Return PDF blob
    return doc.output('blob');
  }
  
  /**
   * Generate CSV data
   * 
   * @param {Array} attendanceRecords - Array of attendance records
   * @param {Object} options - CSV generation options
   * @returns {string} - CSV string
   */
  static generateCsvData(attendanceRecords, options = {}) {
    if (!attendanceRecords || !Array.isArray(attendanceRecords) || attendanceRecords.length === 0) {
      return 'No data available';
    }
    
    // Define headers
    let headers = ['Student ID', 'Student Name', 'Status', 'Arrival Time', 'Verified', 'Verification Method', 'Activity', 'Date'];
    
    // Generate rows
    const rows = attendanceRecords.map(record => {
      const studentId = record.absen_user?.anak?.id_anak || '';
      const studentName = record.absen_user?.anak?.full_name || record.absen_user?.anak?.name || 'Unknown';
      
      let status = 'Absent';
      if (record.absen === 'Ya') status = 'Present';
      else if (record.absen === 'Terlambat') status = 'Late';
      
      const arrivalTime = record.time_arrived ?
        format(parseISO(record.time_arrived), 'HH:mm') : '';
      
      const verified = record.is_verified ? 'Yes' : 'No';
      
      let verificationMethod = 'N/A';
      if (record.verifications && record.verifications.length > 0) {
        const method = record.verifications[0].verification_method;
        if (method === 'qr_code') verificationMethod = 'QR Code';
        else if (method === 'face_recognition') verificationMethod = 'Face Recognition';
        else if (method === 'dual') verificationMethod = 'Dual Verification';
        else if (method === 'manual') verificationMethod = 'Manual Verification';
        else verificationMethod = method;
      }
      
      const activity = record.aktivitas?.jenis_kegiatan || 'N/A';
      const date = record.aktivitas?.tanggal ? 
        format(parseISO(record.aktivitas.tanggal), 'dd/MM/yyyy') : 'N/A';
      
      return [
        studentId,
        studentName,
        status,
        arrivalTime,
        verified,
        verificationMethod,
        activity,
        date
      ];
    });
    
    // Combine headers and rows
    const csvData = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    return csvData;
  }
  
  /**
   * Calculate tutor payment based on attendance
   * 
   * @param {Array} attendanceRecords - Array of attendance records
   * @param {Object} tutorData - Tutor information
   * @param {Object} options - Payment calculation options
   * @returns {Object} - Payment report
   */
  static calculateTutorPayment(attendanceRecords, tutorData, options = {}) {
    const {
      ratePerSession = 50000,
      bonusRate = 0.1,
      verificationThreshold = 0.9
    } = options;
    
    // Filter records associated with the tutor
    const tutorRecords = attendanceRecords.filter(record => {
      return record.absen_user?.tutor?.id_tutor === tutorData.id_tutor;
    });
    
    if (tutorRecords.length === 0) {
      return {
        tutor: tutorData,
        sessions: 0,
        verifiedRate: 0,
        basePayment: 0,
        bonus: 0,
        totalPayment: 0
      };
    }
    
    // Count sessions
    const sessions = new Set();
    tutorRecords.forEach(record => {
      if (record.aktivitas) {
        sessions.add(record.aktivitas.id_aktivitas);
      }
    });
    
    const sessionCount = sessions.size;
    
    // Calculate verification rate
    const verified = tutorRecords.filter(record => record.is_verified).length;
    const verifiedRate = tutorRecords.length > 0 ? verified / tutorRecords.length : 0;
    
    // Calculate payment
    const basePayment = sessionCount * ratePerSession;
    let bonus = 0;
    
    // Apply bonus if verification rate exceeds threshold
    if (verifiedRate >= verificationThreshold) {
      bonus = basePayment * bonusRate;
    }
    
    const totalPayment = basePayment + bonus;
    
    return {
      tutor: tutorData,
      sessions: sessionCount,
      records: tutorRecords.length,
      verified,
      verifiedRate,
      basePayment,
      bonus,
      totalPayment
    };
  }
}

export default AttendanceReportGenerator;