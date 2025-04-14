import React, { useState, useRef } from "react";
import axios from "axios";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const API_BASE_URL = process.env.VITE_FIREWALL_API;

const IndividualDashboard = () => {
  const [ip, setIP] = useState("");
  const [geoData, setGeoData] = useState(null);
  const [riskData, setRiskData] = useState(null);
  const [error, setError] = useState("");



  // Refs for the overall dashboard and for each results section
  const dashboardRef = useRef(null);
  const geoRef = useRef(null);
  const riskRef = useRef(null);

  // API call to fetch geolocation and risk analysis data
  const analyzeIP = async () => {
    setError("");
    setGeoData(null);
    setRiskData(null);

    if (!ip.trim()) {
      setError("Please enter a valid IP address.");
      return;
    }

    try {
      const geoResponse = await axios.get(`https://ipwho.is/${ip}`);
      if (geoResponse.data && geoResponse.data.success) {
        setGeoData(geoResponse.data);
      } else {
        setError(geoResponse.data.message || "Failed to fetch geolocation data.");
      }
    } catch (err) {
      setError("Failed to fetch geolocation data. Please try again later.");
      console.error(err);
    }

    try {
      const riskResponse = await axios.post(`${API_BASE_URL}/api/ip/analyze`, { ip });
      if (riskResponse.data && riskResponse.data.data) {
        setRiskData(riskResponse.data.data);
      } else {
        setError("No risk analysis data received from the server.");
      }
    } catch (err) {
      setError("Failed to fetch risk analysis. Please try again later.");
      console.error(err);
    }
  };

  // CSV export function (unchanged)
  const exportToCSV = () => {
    try {
      const csvRows = [];

      if (geoData) {
        csvRows.push("Geolocation Data");
        csvRows.push("Field,Value");
        Object.keys(geoData).forEach((key) => {
          const value = geoData[key];
          if (value !== null && value !== undefined && !(typeof value === "string" && value.trim() === "")) {
            csvRows.push(`${key},${typeof value === "object" ? JSON.stringify(value) : value}`);
          }
        });
        csvRows.push("");
      }

      if (riskData) {
        csvRows.push("Risk Analysis Data");
        csvRows.push("Field,Value");
        Object.keys(riskData).forEach((key) => {
          const value = riskData[key];
          if (value !== null && value !== undefined && !(typeof value === "string" && value.trim() === "")) {
            csvRows.push(`${key},${typeof value === "object" ? JSON.stringify(value) : value}`);
          }
        });
      }

      const csvString = csvRows.join("\n");
      const blob = new Blob([csvString], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "ipdata.csv");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      setError("Failed to export data. Please try again.");
      console.error(err);
    }
  };

  // Helper: Capture a section and add it to the PDF.
  // The onclone callback hides any element with the "location-map" class.
  const addSectionToPDF = async (sectionElement, pdf) => {
    const canvas = await html2canvas(sectionElement, {
      scale: 2,
      backgroundColor: null,
      onclone: (clonedDoc) => {
        // Hide any element with the class "location-map" (this removes the map from the PDF)
        clonedDoc.querySelectorAll(".location-map").forEach((el) => {
          el.style.display = "none";
        });
        // Also, remove any occurrences of unsupported "oklch" color functions in inline styles.
        clonedDoc.querySelectorAll("*").forEach((el) => {
          if (el.style && el.style.cssText.includes("oklch")) {
            el.style.cssText = el.style.cssText.replace(/oklch\([^)]*\)/g, "transparent");
          }
        });
        // And process any style tags:
        clonedDoc.querySelectorAll("style").forEach((styleEl) => {
          styleEl.textContent = styleEl.textContent.replace(/oklch\([^)]*\)/g, "transparent");
        });
      },
    });
    const imgData = canvas.toDataURL("image/png");

    // Calculate dimensions for A4 (jsPDF uses mm)
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      pdf.addPage();
      position = heightLeft - imgHeight;
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }
  };

  // Download PDF: Process each section separately (excluding the location map) and combine them.
  const downloadPDF = async () => {
    try {
      if (!geoRef.current && !riskRef.current) {
        setError("No results available to export.");
        return;
      }
      const pdf = new jsPDF("p", "mm", "a4");

      if (geoRef.current) {
        await addSectionToPDF(geoRef.current, pdf);
      }
      if (riskRef.current) {
        pdf.addPage();
        await addSectionToPDF(riskRef.current, pdf);
      }

      pdf.save("dashboard_report.pdf");
    } catch (err) {
      setError("Failed to generate PDF. Please try again.");
      console.error(err);
    }
  };

  // Helpers for rendering table values
  const getFeatureDescription = (feature) => {
    const geoDescriptions = {
      ip: "Queried IP address",
      type: "Type of IP (IPv4/IPv6)",
      continent: "Continent",
      continent_code: "Continent code",
      country: "Country",
      country_code: "Country code",
      region: "Region",
      region_code: "Region code",
      regionName: "Region name",
      city: "City",
      latitude: "Latitude",
      longitude: "Longitude",
      postal: "Postal code",
      calling_code: "Calling code",
      capital: "Capital",
      flag: "Flag details",
      connection: "Connection details",
      timezone: "Timezone details",
    };

    const riskDescriptions = {
      ipAddress: "IP Address",
      abuseConfidenceScore: "Abuse Confidence Score",
      riskScore: "Risk Score",
      riskLevel: "Risk Level",
      countryCode: "Country Code",
      region: "Region",
      city: "City",
      usageType: "Usage Type",
      domain: "Domain",
      isp: "ISP",
      totalReports: "Total Reports",
      numDistinctUsers: "Distinct Users",
      lastReportedAt: "Last Reported",
      isWhitelisted: "Whitelisted",
      isTor: "TOR Node",
    };

    return geoDescriptions[feature] || riskDescriptions[feature] || feature;
  };

  const renderValue = (value) => {
    if (typeof value === "object" && value !== null) {
      return JSON.stringify(value);
    }
    return value;
  };

  const formatComplexField = (key, value) => {
    if (typeof value !== "object" || value === null) {
      return renderValue(value);
    }
    if (key === "flag") {
      return (
        <div>
          {value.img && (
            <div>
              <strong>Flag Image URL:</strong>{" "}
              <a href={value.img} target="_blank" rel="noopener noreferrer">
                {value.img}
              </a>
            </div>
          )}
          {value.emoji && (
            <div>
              <strong>Emoji:</strong> {value.emoji}
            </div>
          )}
          {value.emoji_unicode && (
            <div>
              <strong>Emoji Unicode:</strong> {value.emoji_unicode}
            </div>
          )}
        </div>
      );
    } else if (key === "connection") {
      return (
        <div>
          {value.asn && <div><strong>ASN:</strong> {value.asn}</div>}
          {value.org && <div><strong>Organization:</strong> {value.org}</div>}
          {value.isp && <div><strong>ISP:</strong> {value.isp}</div>}
          {value.domain && value.domain.trim() !== "" && (
            <div>
              <strong>Domain:</strong> {value.domain}
            </div>
          )}
        </div>
      );
    } else if (key === "timezone") {
      return (
        <div>
          {value.id && <div><strong>Timezone ID:</strong> {value.id}</div>}
          {value.abbr && <div><strong>Abbreviation:</strong> {value.abbr}</div>}
          {typeof value.is_dst === "boolean" && (
            <div>
              <strong>Daylight Saving Time:</strong> {value.is_dst ? "Yes" : "No"}
            </div>
          )}
          {(value.offset || value.utc) && (
            <div>
              <strong>UTC Offset:</strong> {value.offset} (UTC {value.utc})
            </div>
          )}
          {value.current_time && (
            <div>
              <strong>Current Time:</strong> {value.current_time}
            </div>
          )}
        </div>
      );
    }
    return renderValue(value);
  };

  // Colors for the on-screen Bar Chart
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <div
      ref={dashboardRef}
      id="dashboard-content"
      className="min-h-screen w-full overflow-x-hidden bg-[radial-gradient(circle,_#000000_20%,_#003300_80%)] text-[#00ff00]"
    >
      {/* Header */}
      <header className="text-center py-10 shadow-md my-5">
        <h1 className="animate-glitch text-4xl font-bold">
          IP Geolocation &amp; Risk Analysis Dashboard
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center p-6">
        {/* Input Section */}
        <section className="bg-[#001100] text-[#00ff00] rounded-lg shadow-lg w-11/12 my-8 p-8">
          <h2 className="animate-glitch text-center text-2xl mb-6">Enter IP Address</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6 w-full">
            <input
              type="text"
              className="bg-[#001100] border border-[#00ff00] text-[#00ff00] p-3 rounded shadow-md text-center flex-1"
              placeholder="e.g. 8.8.8.8"
              value={ip}
              onChange={(e) => setIP(e.target.value)}
            />
            <button
              onClick={analyzeIP}
              className="bg-[#003300] border border-[#00ff00] text-[#00ff00] px-5 py-3 rounded shadow-md cursor-pointer transition-colors duration-300 hover:bg-[#00ff00] hover:text-[#003300]"
            >
              Analyze IP
            </button>
            {/* <button
              onClick={exportToCSV}
              className="bg-[#003300] border border-[#00ff00] text-[#00ff00] px-5 py-3 rounded shadow-md cursor-pointer transition-colors duration-300 hover:bg-[#00ff00] hover:text-[#003300]"
            >
              Export CSV
            </button>
            <button
              onClick={downloadPDF}
              className="bg-[#003300] border border-[#00ff00] text-[#00ff00] px-5 py-3 rounded shadow-md cursor-pointer transition-colors duration-300 hover:bg-[#00ff00] hover:text-[#003300]"
            >
              Download PDF
            </button> */}
          </div>
          {error && <p className="text-red-500 text-center mt-4">{error}</p>}
        </section>

        {/* Results Section */}
        {(geoData || riskData) && (
          <section className="w-11/12 my-8">
            {/* Geolocation Section (without map for PDF) */}
            {geoData && (
              <div ref={geoRef} className="bg-[#001100] text-[#00ff00] rounded-lg shadow-lg p-8 mb-8">
                <h2 className="animate-glitch text-center text-3xl mb-6">Geolocation Data</h2>
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Geolocation Table */}
                  <div className="w-full overflow-x-auto" style={{ height: "500px" }}>
                    <table className="min-w-full divide-y divide-green-500">
                      <thead className="bg-green-800">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-medium uppercase">Parameter</th>
                          <th className="px-4 py-2 text-left text-sm font-medium uppercase">Value</th>
                        </tr>
                      </thead>
                      <tbody className="bg-[#001100] divide-y divide-green-500">
                        {Object.keys(geoData).map((key, index) => {
                          const value = geoData[key];
                          if (value === null || value === undefined || (typeof value === "string" && value.trim() === "")) {
                            return null;
                          }
                          return (
                            <tr key={index} className="hover:bg-[#003300]">
                              <td className="px-4 py-2">{getFeatureDescription(key)}</td>
                              <td className="px-4 py-2">
                                {(key === "flag" || key === "connection" || key === "timezone")
                                  ? formatComplexField(key, value)
                                  : renderValue(value)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {/* The location map is wrapped in a container with class "location-map"
                      so it will be hidden in the PDF output */}
                  <div className="location-map w-full md:w-1/2" style={{ height: "500px" }}>
                    {geoData.latitude && geoData.longitude && (
                      <div className="h-full">
                        <h3 className="animate-glitch text-2xl mb-4 text-center">Location Map</h3>
                        <div className="h-full w-full rounded-lg overflow-hidden shadow-lg">
                          <MapContainer
                            center={[geoData.latitude, geoData.longitude]}
                            zoom={16}
                            scrollWheelZoom={false}
                            className="h-full w-full"
                          >
                            <TileLayer
                              attribution={`${geoData.city}, ${geoData.region}, ${geoData.country}`}
                              url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
                            />
                            <Marker position={[geoData.latitude, geoData.longitude]}>
                              <Popup>
                                {geoData.city ? geoData.city + ", " : ""}
                                {geoData.region ? geoData.region + ", " : ""}
                                {geoData.country}
                              </Popup>
                            </Marker>
                            <Circle
                              center={[geoData.latitude, geoData.longitude]}
                              radius={10}
                              pathOptions={{ color: "#00ff00", fillColor: "#00ff00", fillOpacity: 0.2 }}
                            />
                          </MapContainer>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Risk Analysis Section */}
            {riskData && (
              <div ref={riskRef} className="bg-[#001100] text-[#00ff00] rounded-lg shadow-lg p-8">
                <h2 className="animate-glitch text-center text-3xl mb-6">Risk Analysis Results</h2>
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Risk Analysis Table */}
                  <div className="w-full md:w-1/2 overflow-x-auto">
                    <table className="min-w-full divide-y divide-green-500">
                      <thead className="bg-green-800">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-medium uppercase">Parameter</th>
                          <th className="px-4 py-2 text-left text-sm font-medium uppercase">Value</th>
                        </tr>
                      </thead>
                      <tbody className="bg-[#001100] divide-y divide-green-500">
                        <tr className="hover:bg-[#003300]">
                          <td className="px-4 py-2">IP Address</td>
                          <td className="px-4 py-2">{riskData.ipAddress || "N/A"}</td>
                        </tr>
                        <tr className="hover:bg-[#003300]">
                          <td className="px-4 py-2">Abuse Confidence Score</td>
                          <td className="px-4 py-2">{riskData.abuseConfidenceScore ?? "N/A"}</td>
                        </tr>
                        <tr className="hover:bg-[#003300]">
                          <td className="px-4 py-2">Risk Score</td>
                          <td className="px-4 py-2">{riskData.riskScore ?? "N/A"}</td>
                        </tr>
                        <tr className="hover:bg-[#003300]">
                          <td className="px-4 py-2">Risk Level</td>
                          <td className="px-4 py-2">{riskData.riskLevel ?? "N/A"}</td>
                        </tr>
                        <tr className="hover:bg-[#003300]">
                          <td className="px-4 py-2">Country</td>
                          <td className="px-4 py-2">{riskData.countryCode || "N/A"}</td>
                        </tr>
                        {riskData.region && (
                          <tr className="hover:bg-[#003300]">
                            <td className="px-4 py-2">Region</td>
                            <td className="px-4 py-2">{riskData.region}</td>
                          </tr>
                        )}
                        {riskData.city && (
                          <tr className="hover:bg-[#003300]">
                            <td className="px-4 py-2">City</td>
                            <td className="px-4 py-2">{riskData.city}</td>
                          </tr>
                        )}
                        {riskData.latitude && riskData.longitude && (
                          <>
                            <tr className="hover:bg-[#003300]">
                              <td className="px-4 py-2">Latitude</td>
                              <td className="px-4 py-2">{riskData.latitude}</td>
                            </tr>
                            <tr className="hover:bg-[#003300]">
                              <td className="px-4 py-2">Longitude</td>
                              <td className="px-4 py-2">{riskData.longitude}</td>
                            </tr>
                          </>
                        )}
                        <tr className="hover:bg-[#003300]">
                          <td className="px-4 py-2">ISP</td>
                          <td className="px-4 py-2">{riskData.isp || "N/A"}</td>
                        </tr>
                        <tr className="hover:bg-[#003300]">
                          <td className="px-4 py-2">Domain</td>
                          <td className="px-4 py-2">{riskData.domain || "N/A"}</td>
                        </tr>
                        <tr className="hover:bg-[#003300]">
                          <td className="px-4 py-2">Distinct Users</td>
                          <td className="px-4 py-2">{riskData.numDistinctUsers || "N/A"}</td>
                        </tr>
                        <tr className="hover:bg-[#003300]">
                          <td className="px-4 py-2">Total Reports</td>
                          <td className="px-4 py-2">{riskData.totalReports || 0}</td>
                        </tr>
                        <tr className="hover:bg-[#003300]">
                          <td className="px-4 py-2">Usage Type</td>
                          <td className="px-4 py-2">{riskData.usageType || "N/A"}</td>
                        </tr>
                        <tr className="hover:bg-[#003300]">
                          <td className="px-4 py-2">Last Reported</td>
                          <td className="px-4 py-2">
                            {riskData.lastReportedAt ? new Date(riskData.lastReportedAt).toLocaleString() : "N/A"}
                          </td>
                        </tr>
                        <tr className="hover:bg-[#003300]">
                          <td className="px-4 py-2">Whitelisted</td>
                          <td className="px-4 py-2">{riskData.isWhitelisted ? "Yes" : "No"}</td>
                        </tr>
                        <tr className="hover:bg-[#003300]">
                          <td className="px-4 py-2">TOR Node</td>
                          <td className="px-4 py-2">{riskData.isTor ? "Yes" : "No"}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Risk Analysis Bar Graph */}
                  {riskData.shapExplanation && riskData.shapExplanation.length > 0 && (
                    <div className="w-full md:w-1/2 flex flex-col items-center">
                      <h3 className="animate-glitch text-center text-xl mb-4">SHAP Value Visualization</h3>
                      <BarChart
                        width={500}
                        height={300}
                        data={riskData.shapExplanation}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <XAxis dataKey="feature" stroke="#00ff00" />
                        <YAxis stroke="#00ff00" />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="contribution">
                          {riskData.shapExplanation.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.contribution > 0 ? "red" : "green"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </div>
                  )}
                </div>

                {/* SHAP Explanation Table */}
                {riskData.shapExplanation && riskData.shapExplanation.length > 0 && (
                  <div className="mt-8 overflow-x-auto">
                    <h3 className="animate-glitch text-center text-2xl mb-4">SHAP Feature Explanations</h3>
                    <table className="min-w-full divide-y divide-green-500">
                      <thead className="bg-green-800">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-medium uppercase">Feature</th>
                          <th className="px-4 py-2 text-left text-sm font-medium uppercase">Value</th>
                          <th className="px-4 py-2 text-left text-sm font-medium uppercase">Contribution</th>
                          <th className="px-4 py-2 text-left text-sm font-medium uppercase">Explanation</th>
                        </tr>
                      </thead>
                      <tbody className="bg-[#001100] divide-y divide-green-500">
                        {riskData.shapExplanation.map((item, index) => (
                          <tr key={index} className="hover:bg-[#003300]">
                            <td className="px-4 py-2">{getFeatureDescription(item.feature)}</td>
                            <td className="px-4 py-2">{item.value}</td>
                            <td className="px-4 py-2">{item.contribution.toFixed(4)}</td>
                            <td className="px-4 py-2">{item.explanation}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-black fixed bottom-0 left-0 right-0 text-center py-4">
        <p className="text-[#00ff00] text-xs">
          &copy; {new Date().getFullYear()} IP Geolocation &amp; Risk Analysis Dashboard. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default IndividualDashboard;


