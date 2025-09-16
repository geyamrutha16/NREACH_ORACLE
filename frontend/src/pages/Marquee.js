import React from "react";
import watermarkLogo from "./logo.png";

const Marquee = () => {
    return (
        <div>
            <style>
                {`
          .marquee-container {
            width: 100%;
            overflow: hidden;
            white-space: nowrap;
            background: #f9f9f9; /* optional */
          }

          .marquee-content {
            display: inline-block;
            padding-left: 100%;
            animation: marquee 15s linear infinite;
          }

          @keyframes marquee {
            0% {
              transform: translateX(0%);
            }
            100% {
              transform: translateX(-100%);
            }
          }

          .marquee-text {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 18px;
            font-weight: bold;
            color: #0313beff;
          }
        `}
            </style>

            <div className="marquee-container">
                <div className="marquee-content">
                    <h1 className="marquee-text">
                        <span>
                            <img
                                src={watermarkLogo}
                                alt="logo"
                                style={{ height: "40px", width: "40px" }}
                            />
                        </span>
                        NARAYANA ENGINEERING COLLEGE GUDUR
                        <span>
                            <img
                                src={watermarkLogo}
                                alt="logo"
                                style={{ height: "40px", width: "40px" }}
                            />
                        </span>
                    </h1>
                </div>
            </div>
        </div>
    );
};

export default Marquee;
