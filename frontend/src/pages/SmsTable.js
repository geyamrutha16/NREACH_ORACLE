import React, { useEffect, useState } from "react";
import axios from "axios";
import SmsModal from "./SmsModal";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const SmsTable = ({ refresh }) => {
    const [smsRecords, setSmsRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filterYear, setFilterYear] = useState("");
    const [filterSection, setFilterSection] = useState("");
    const [filterRollNo, setFilterRollNo] = useState("");
    const [filterAcademicYear, setFilterAcademicYear] = useState("");
    const [filterDepartment, setFilterDepartment] = useState("");
    const [filterAttendance, setFilterAttendance] = useState("");
    const [selectedSms, setSelectedSms] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const loginRole = localStorage.getItem("role") || "operator";

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const fetchSms = async () => {
        setLoading(true);
        try {
            console.log("🔄 Fetching SMS records...");
            const token = localStorage.getItem("token");
            const res = await axios.get(
                "https://nreach-data.onrender.com/api/sms/results",
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log(`✅ Fetched ${res.data.length} SMS records`);
            setSmsRecords(res.data || []);
        } catch (err) {
            console.error("❌ Error fetching SMS results:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSms();
    }, [refresh]);

    // Filtered records
    const filteredRecords = smsRecords.filter((sms) => {
        const yearMatch = filterYear ? sms.year === filterYear : true;
        const sectionMatch = filterSection ? sms.section === filterSection : true;
        const rollMatch = filterRollNo
            ? sms.rollNo?.toLowerCase().includes(filterRollNo.toLowerCase())
            : true;
        const academicYearMatch = filterAcademicYear
            ? sms.academicYear === filterAcademicYear
            : true;
        const departmentMatch =
            loginRole === "operator" && filterDepartment
                ? sms.department === filterDepartment
                : true;
        let attendanceMatch = true;
        if (filterAttendance === "low") {
            attendanceMatch = sms.attendance < 50;
        } else if (filterAttendance === "medium") {
            attendanceMatch = sms.attendance >= 50 && sms.attendance <= 75;
        } else if (filterAttendance === "high") {
            attendanceMatch = sms.attendance > 75;
        }

        return (
            yearMatch &&
            sectionMatch &&
            rollMatch &&
            academicYearMatch &&
            departmentMatch &&
            attendanceMatch
        );
    });

    const clearFilters = () => {
        setFilterYear("");
        setFilterSection("");
        setFilterRollNo("");
        setFilterAcademicYear("");
        setFilterDepartment("");
        setFilterAttendance("");
    };

    // Excel download
    const downloadExcel = () => {
        if (!filteredRecords.length) return;

        const worksheetData = filteredRecords.map((sms) => ({
            "Roll Number": sms.rollNo,
            Name: sms.name,
            "Phone Number": sms.phoneNumber,
            Year: sms.year,
            "Class": sms.section,
            "Academic Year": sms.academicYear,
            Department: sms.department,
            Status: sms.status,
            "Sent At": sms.createdAt ? new Date(sms.createdAt).toLocaleString() : "N/A",
            Acknowledged: sms.seen ? "Yes" : "No",
        }));

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "SMS Records");

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        saveAs(data, "sms_filtered_data.xlsx");
    };

    return (
        <div style={{ marginTop: "10px" }}>
            <h2 style={{ marginBottom: "1rem" }}>📊 SMS TrackBoard</h2>

            {/* Filters */}
            <div
                style={{
                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    gap: isMobile ? "12px" : "20px",
                    marginBottom: "20px",
                    alignItems: isMobile ? "stretch" : "center",
                    flexWrap: "wrap",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        gap: "12px",
                        flexDirection: isMobile ? "column" : "row",
                        width: isMobile ? "100%" : "auto",
                    }}
                >
                    <label
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: isMobile ? "flex-start" : "center",
                            gap: "8px",
                            flex: isMobile ? "1" : "none",
                            width: isMobile ? "100%" : "auto",
                        }}
                    >
                        {isMobile && <span style={{ fontWeight: 500 }}>Year:</span>}
                        <select
                            value={filterYear}
                            onChange={(e) => setFilterYear(e.target.value)}
                            style={{
                                padding: "8px 12px",
                                borderRadius: "6px",
                                border: "1px solid #ccc",
                                flex: "1",
                            }}
                        >
                            <option value="">{isMobile ? "All Years" : "All"}</option>
                            <option value="I">I</option>
                            <option value="II">II</option>
                            <option value="III">III</option>
                            <option value="IV">IV</option>
                        </select>
                        {!isMobile && <span style={{ fontWeight: 500 }}>Year</span>}
                    </label>

                    <label
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: isMobile ? "flex-start" : "center",
                            gap: "8px",
                            flex: isMobile ? "1" : "none",
                            width: isMobile ? "100%" : "auto",
                        }}
                    >
                        {isMobile && <span style={{ fontWeight: 500 }}>Section:</span>}
                        <select
                            value={filterSection}
                            onChange={(e) => setFilterSection(e.target.value)}
                            style={{
                                padding: "8px 12px",
                                borderRadius: "6px",
                                border: "1px solid #ccc",
                                flex: "1",
                            }}
                        >
                            <option value="">{isMobile ? "All Sections" : "All"}</option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                        </select>
                        {!isMobile && <span style={{ fontWeight: 500 }}>Section</span>}
                    </label>

                    <label
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: isMobile ? "flex-start" : "center",
                            gap: "8px",
                            flex: isMobile ? "1" : "none",
                            width: isMobile ? "100%" : "auto",
                        }}
                    >
                        {isMobile && <span style={{ fontWeight: 500 }}>Academic Year:</span>}
                        <select
                            value={filterAcademicYear}
                            onChange={(e) => setFilterAcademicYear(e.target.value)}
                            style={{
                                padding: "8px 12px",
                                borderRadius: "6px",
                                border: "1px solid #ccc",
                                flex: "1",
                            }}
                        >
                            <option value="">{isMobile ? "All Academic Years" : "All"}</option>
                            {Array.from(
                                { length: new Date().getFullYear() - 2021 },
                                (_, i) => 2022 + i
                            ).map((year) => (
                                <option key={year} value={year.toString()}>
                                    {year}
                                </option>
                            ))}
                        </select>
                        {!isMobile && <span style={{ fontWeight: 500 }}>Academic Year</span>}
                    </label>

                    {loginRole === "operator" && (
                        <label
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: isMobile ? "flex-start" : "center",
                                gap: "8px",
                                flex: isMobile ? "1" : "none",
                                width: isMobile ? "100%" : "auto",
                            }}
                        >
                            {isMobile && <span style={{ fontWeight: 500 }}>Department:</span>}
                            <select
                                value={filterDepartment}
                                onChange={(e) => setFilterDepartment(e.target.value)}
                                style={{
                                    padding: "8px 12px",
                                    borderRadius: "6px",
                                    border: "1px solid #ccc",
                                    flex: "1",
                                }}
                            >
                                <option value="">{isMobile ? "All Departments" : "All"}</option>
                                <option value="CSE">CSE</option>
                                <option value="ECE">ECE</option>
                                <option value="EEE">EEE</option>
                                <option value="MECH">MECH</option>
                                <option value="CIVIL">CIVIL</option>
                            </select>
                            {!isMobile && <span style={{ fontWeight: 500 }}>Department</span>}
                        </label>
                    )}
                </div>

                <div
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: isMobile ? "flex-start" : "center",
                        gap: "8px",
                        flex: isMobile ? "1" : "none",
                        width: isMobile ? "100%" : "auto",
                    }}
                >
                    <input
                        type="text"
                        value={filterRollNo}
                        onChange={(e) => setFilterRollNo(e.target.value)}
                        placeholder="Search Roll No"
                        style={{
                            padding: "8px 8px",
                            borderRadius: "6px",
                            border: "1px solid #ccc",
                            flex: "1",
                            width: isMobile ? "50%" : "100px",
                        }}
                    />
                    <span style={{ fontWeight: 500 }}>Roll No</span>
                </div>
                <div>
                    <label
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: isMobile ? "flex-start" : "center",
                            gap: "8px",
                            flex: isMobile ? "1" : "none",
                            width: isMobile ? "100%" : "auto",
                        }}
                    >
                        {isMobile && <span style={{ fontWeight: 500 }}>Attendance:</span>}
                        <select
                            value={filterAttendance}
                            onChange={(e) => setFilterAttendance(e.target.value)}
                            style={{
                                padding: "8px 12px",
                                borderRadius: "6px",
                                border: "1px solid #ccc",
                                flex: "1",
                            }}
                        >
                            <option value="">All</option>
                            <option value="low">Below 50%</option>
                            <option value="medium">50% - 65%</option>
                            <option value="high">65% - 75%</option>
                        </select>
                        {!isMobile && <span style={{ fontWeight: 500 }}>Attendance</span>}
                    </label>

                </div>

                <button
                    onClick={fetchSms}
                    style={{
                        padding: "8px 16px",
                        borderRadius: "6px",
                        border: "none",
                        background: "#10B981",
                        color: "#fff",
                        fontWeight: "600",
                        cursor: "pointer",
                        width: isMobile ? "100%" : "auto",
                    }}
                >
                    🔄 Refresh
                </button>

                <button
                    onClick={downloadExcel}
                    style={{
                        padding: "8px 16px",
                        borderRadius: "6px",
                        border: "none",
                        background: "#3B82F6",
                        color: "#fff",
                        fontWeight: "600",
                        cursor: "pointer",
                        width: isMobile ? "100%" : "auto",
                    }}
                >
                    📥 Download Excel
                </button>

                <button
                    onClick={clearFilters}
                    style={{
                        padding: "8px 16px",
                        borderRadius: "6px",
                        border: "none",
                        background: "#F59E0B",
                        color: "#fff",
                        fontWeight: "600",
                        cursor: "pointer",
                        width: isMobile ? "100%" : "auto",
                    }}
                >
                    🧹 Clear Filters
                </button>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <div
                    style={{
                        overflowX: "auto",
                        borderRadius: "8px",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                        WebkitOverflowScrolling: "touch",
                        maxWidth: "100vw",
                        position: "relative",
                    }}
                >
                    <div
                        style={{
                            overflowX: isMobile ? "auto" : "hidden",
                            width: "100%",
                        }}
                    >
                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                overflow: "hidden",
                                borderRadius: "8px",
                                minWidth: isMobile ? "700px" : "100%",
                            }}
                        >
                            <thead
                                style={{
                                    background: "#3B82F6",
                                    color: "#fff",
                                    position: isMobile ? "sticky" : "relative",
                                    left: 0,
                                }}
                            >
                                <tr>
                                    <th
                                        style={{
                                            padding: "12px",
                                            position: isMobile ? "sticky" : "static",
                                            left: isMobile ? 0 : "auto",
                                        }}
                                    >
                                        RollNumber
                                    </th>
                                    <th style={{ padding: "12px" }}>Name</th>
                                    <th style={{ padding: "12px" }}>Phone Number</th>
                                    <th style={{ padding: "12px" }}>Year</th>
                                    <th style={{ padding: "12px" }}>Class</th>
                                    {loginRole === "operator" && <th style={{ padding: "12px" }}>Department</th>}
                                    <th style={{ padding: "12px" }}>Attendance %</th>
                                    <th style={{ padding: "12px" }}>Status</th>
                                    <th style={{ padding: "12px" }}>Sent At</th>
                                    <th style={{ padding: "12px" }}>Acknowledged</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRecords.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={loginRole === "operator" ? 9 : 8}
                                            style={{ textAlign: "center", padding: "1rem" }}
                                        >
                                            No records found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRecords.map((sms, i) => (
                                        <tr
                                            key={sms._id}
                                            style={{
                                                background: i % 2 === 0 ? "#F9FAFB" : "#FFFFFF",
                                                cursor: "pointer",
                                            }}
                                            onClick={() => setSelectedSms(sms)}
                                        >
                                            <td
                                                style={{
                                                    padding: "12px",
                                                    position: isMobile ? "sticky" : "static",
                                                    left: isMobile ? 0 : "auto",
                                                    background: i % 2 === 0 ? "#F9FAFB" : "#FFFFFF",
                                                }}
                                            >
                                                {sms.rollNo}
                                            </td>
                                            <td style={{ padding: "12px" }}>{sms.name}</td>
                                            <td style={{ padding: "12px" }}>{sms.phoneNumber}</td>
                                            <td style={{ padding: "12px" }}>{sms.year}</td>
                                            <td style={{ padding: "12px" }}>{sms.section}</td>
                                            {loginRole === "operator" && (
                                                <td style={{ padding: "12px" }}>{sms.department}</td>
                                            )}
                                            <td style={{ padding: "12px" }}>{sms.attendance || "N/A"}%</td>
                                            <td
                                                style={{
                                                    padding: "12px",
                                                    color: (sms.status === "sent" || sms.status === "delivered") ? "#16A34A" : "#DC2626",
                                                    fontWeight: "600",
                                                }}
                                            >
                                                {sms.status?.toUpperCase?.()}
                                            </td>
                                            <td style={{ padding: "12px" }}>
                                                {sms.createdAt
                                                    ? new Date(sms.createdAt).toLocaleString()
                                                    : "N/A"}
                                            </td>
                                            <td style={{ padding: "12px" }}>
                                                {sms.seen ? "✅" : "❌"}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {selectedSms && (
                <SmsModal sms={selectedSms} onClose={() => setSelectedSms(null)} />
            )}
        </div>
    );
};

export default SmsTable;
/*import React, { useEffect, useState } from "react";
import axios from "axios";
import SmsModal from "./SmsModal";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const SmsTable = ({ refresh }) => {
    const [smsRecords, setSmsRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filterYear, setFilterYear] = useState("");
    const [filterSection, setFilterSection] = useState("");
    const [filterRollNo, setFilterRollNo] = useState("");
    const [filterAcademicYear, setFilterAcademicYear] = useState("");
    const [filterDepartment, setFilterDepartment] = useState("");
    const [selectedSms, setSelectedSms] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const loginRole = localStorage.getItem("role") || "operator";

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const fetchSms = async () => {
        setLoading(true);
        try {
            console.log("🔄 Fetching SMS records...");
            const token = localStorage.getItem("token");
            const res = await axios.get(
                "https://nreach-data.onrender.com/api/sms/results",
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log(`✅ Fetched ${res.data.length} SMS records`);
            setSmsRecords(res.data || []);
        } catch (err) {
            console.error("❌ Error fetching SMS results:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSms();
    }, [refresh]);

    // Filtered records
    const filteredRecords = smsRecords.filter((sms) => {
        const yearMatch = filterYear ? sms.year === filterYear : true;
        const sectionMatch = filterSection ? sms.section === filterSection : true;
        const rollMatch = filterRollNo
            ? sms.rollNo?.toLowerCase().includes(filterRollNo.toLowerCase())
            : true;
        const academicYearMatch = filterAcademicYear
            ? sms.academicYear === filterAcademicYear
            : true;
        const departmentMatch =
            loginRole === "operator" && filterDepartment
                ? sms.department === filterDepartment
                : true;
        return yearMatch && sectionMatch && rollMatch && academicYearMatch && departmentMatch;
    });

    // Excel download
    const downloadExcel = () => {
        if (!filteredRecords.length) return;

        const worksheetData = filteredRecords.map((sms) => ({
            "Roll Number": sms.rollNo,
            Name: sms.name,
            "Phone Number": sms.phoneNumber,
            Year: sms.year,
            "Class": sms.section,
            "Academic Year": sms.academicYear,
            Department: sms.department,
            Status: sms.status,
            "Sent At": sms.createdAt ? new Date(sms.createdAt).toLocaleString() : "N/A",
            Acknowledged: sms.seen ? "Yes" : "No",
        }));

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "SMS Records");

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        saveAs(data, "sms_filtered_data.xlsx");
    };

    return (
        <div style={{ marginTop: "5px" }}>
            <h2 style={{ marginBottom: "1rem" }}>📊 SMS TrackBoard</h2>

<div
    style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        gap: isMobile ? "12px" : "20px",
        marginBottom: "20px",
        alignItems: isMobile ? "stretch" : "center",
        flexWrap: "wrap",
    }}
>
    <div
        style={{
            display: "flex",
            gap: "12px",
            flexDirection: isMobile ? "column" : "row",
            width: isMobile ? "100%" : "auto",
        }}
    >
        <label
            style={{
                display: "flex",
                flexDirection: "row",
                alignItems: isMobile ? "flex-start" : "center",
                gap: "8px",
                flex: isMobile ? "1" : "none",
                width: isMobile ? "100%" : "auto",
            }}
        >
            {isMobile && <span style={{ fontWeight: 500 }}>Year:</span>}
            <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                style={{
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                    outline: "2px solid #002147",
                    flex: "1",
                }}
            >
                <option value="">{isMobile ? "All Years" : "All"}</option>
                <option value="I">I</option>
                <option value="II">II</option>
                <option value="III">III</option>
                <option value="IV">IV</option>
            </select>
            {!isMobile && <span style={{ fontWeight: 500 }}>Year</span>}
        </label>

        <label
            style={{
                display: "flex",
                flexDirection: "row",
                alignItems: isMobile ? "flex-start" : "center",
                gap: "8px",
                flex: isMobile ? "1" : "none",
                width: isMobile ? "100%" : "auto",
            }}
        >
            {isMobile && <span style={{ fontWeight: 500 }}>Section:</span>}
            <select
                value={filterSection}
                onChange={(e) => setFilterSection(e.target.value)}
                style={{
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                    flex: "1",
                    outline: "2px solid #002147",
                }}
            >
                <option value="">{isMobile ? "All Sections" : "All"}</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
            </select>
            {!isMobile && <span style={{ fontWeight: 500 }}>Section</span>}
        </label>

        <label
            style={{
                display: "flex",
                flexDirection: "row",
                alignItems: isMobile ? "flex-start" : "center",
                gap: "8px",
                flex: isMobile ? "1" : "none",
                width: isMobile ? "100%" : "auto",
            }}
        >
            {isMobile && <span style={{ fontWeight: 500 }}>Academic Year:</span>}
            <select
                value={filterAcademicYear}
                onChange={(e) => setFilterAcademicYear(e.target.value)}
                style={{
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                    flex: "1",
                    outline: "2px solid #002147",
                }}
            >
                <option value="">{isMobile ? "All Academic Years" : "All"}</option>
                {Array.from(
                    { length: new Date().getFullYear() - 2021 },
                    (_, i) => 2022 + i
                ).map((year) => (
                    <option key={year} value={year.toString()}>
                        {year}
                    </option>
                ))}
            </select>
            {!isMobile && <span style={{ fontWeight: 500 }}>Academic Year</span>}
        </label>

        {loginRole === "operator" && (
            <label
                style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: isMobile ? "flex-start" : "center",
                    gap: "8px",
                    flex: isMobile ? "1" : "none",
                    width: isMobile ? "100%" : "auto",
                }}
            >
                {isMobile && <span style={{ fontWeight: 500 }}>Department:</span>}
                <select
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                    style={{
                        padding: "8px 12px",
                        borderRadius: "6px",
                        border: "1px solid #ccc",
                        flex: "1",
                        outline: "2px solid #002147",
                    }}
                >
                    <option value="">{isMobile ? "All Departments" : "All"}</option>
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="EEE">EEE</option>
                    <option value="MECH">MECH</option>
                    <option value="CIVIL">CIVIL</option>
                </select>
                {!isMobile && <span style={{ fontWeight: 500 }}>Department</span>}
            </label>
        )}
    </div>

    <div
        style={{
            display: "flex",
            flexDirection: "row",
            alignItems: isMobile ? "flex-start" : "center",
            gap: "8px",
            flex: isMobile ? "1" : "none",
            width: isMobile ? "100%" : "auto",
        }}
    >
        <span style={{ fontWeight: 500 }}>Roll No:</span>
        <input
            type="text"
            value={filterRollNo}
            onChange={(e) => setFilterRollNo(e.target.value)}
            placeholder="Search Roll No"
            style={{
                padding: "8px 8px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                flex: "1",
                outline: "2px solid #002147",
                width: isMobile ? "50%" : "200px",
            }}
        />
    </div>

    <button
        onClick={fetchSms}
        style={{
            padding: "8px 16px",
            borderRadius: "6px",
            border: "none",
            background: "#10B981",
            color: "#fff",
            fontWeight: "600",
            cursor: "pointer",
            width: isMobile ? "100%" : "auto",
        }}
    >
        🔄 Refresh
    </button>

    <button
        onClick={downloadExcel}
        style={{
            padding: "8px 16px",
            borderRadius: "6px",
            border: "none",
            background: "#002147",
            color: "#fff",
            fontWeight: "600",
            cursor: "pointer",
            width: isMobile ? "100%" : "auto",
        }}
    >
        📥 Download Excel
    </button>
</div>

{
    loading ? (
        <p>Loading...</p>
    ) : (
        <div
            style={{
                overflowX: "auto",
                borderRadius: "8px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                WebkitOverflowScrolling: "touch",
                maxWidth: "100vw",
                position: "relative",
            }}
        >
            <div
                style={{
                    overflowX: isMobile ? "auto" : "hidden",
                    width: "100%",
                }}
            >
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        overflow: "hidden",
                        borderRadius: "8px",
                        minWidth: isMobile ? "700px" : "100%",
                    }}
                >
                    <thead
                        style={{
                            background: "#3B82F6",
                            color: "#fff",
                            position: isMobile ? "sticky" : "relative",
                            left: 0,
                        }}
                    >
                        <tr>
                            <th
                                style={{
                                    padding: "12px",
                                    position: isMobile ? "sticky" : "static",
                                    left: isMobile ? 0 : "auto",
                                }}
                            >
                                RollNumber
                            </th>
                            <th style={{ padding: "12px" }}>Name</th>
                            <th style={{ padding: "12px" }}>Phone Number</th>
                            <th style={{ padding: "12px" }}>Year</th>
                            <th style={{ padding: "12px" }}>Class</th>
                            {loginRole === "operator" && <th style={{ padding: "12px" }}>Department</th>}
                            <th style={{ padding: "12px" }}>Status</th>
                            <th style={{ padding: "12px" }}>Sent At</th>
                            <th style={{ padding: "12px" }}>Acknowledged</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRecords.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={loginRole === "operator" ? 9 : 8}
                                    style={{ textAlign: "center", padding: "1rem" }}
                                >
                                    No records found
                                </td>
                            </tr>
                        ) : (
                            filteredRecords.map((sms, i) => (
                                <tr
                                    key={sms._id}
                                    style={{
                                        background: i % 2 === 0 ? "#F9FAFB" : "#FFFFFF",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => setSelectedSms(sms)}
                                >
                                    <td
                                        style={{
                                            padding: "12px",
                                            position: isMobile ? "sticky" : "static",
                                            left: isMobile ? 0 : "auto",
                                            background: i % 2 === 0 ? "#F9FAFB" : "#FFFFFF",
                                        }}
                                    >
                                        {sms.rollNo}
                                    </td>
                                    <td style={{ padding: "12px" }}>{sms.name}</td>
                                    <td style={{ padding: "12px" }}>{sms.phoneNumber}</td>
                                    <td style={{ padding: "12px" }}>{sms.year}</td>
                                    <td style={{ padding: "12px" }}>{sms.section}</td>
                                    {loginRole === "operator" && (
                                        <td style={{ padding: "12px" }}>{sms.department}</td>
                                    )}
                                    <td
                                        style={{
                                            padding: "12px",
                                            color:
                                                sms.status === "sent"
                                                    ? "#16A34A"
                                                    : "#DC2626",
                                            fontWeight: "600",
                                        }}
                                    >
                                        {sms.status?.toUpperCase?.()}
                                    </td>
                                    <td style={{ padding: "12px" }}>
                                        {sms.createdAt
                                            ? new Date(sms.createdAt).toLocaleString()
                                            : "N/A"}
                                    </td>
                                    <td style={{ padding: "12px" }}>
                                        {sms.seen ? "✅" : "❌"}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

{
    selectedSms && (
        <SmsModal sms={selectedSms} onClose={() => setSelectedSms(null)} />
    )
}
        </div >
    );
};

export default SmsTable;
*/