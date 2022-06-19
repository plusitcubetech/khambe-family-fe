import React, { useState, useEffect } from "react";
import "./styles.css";
import Tree from "react-d3-tree";
import axios from "axios";
const separation = {
  nonSiblings: 2,
  siblings: 2,
};
const nodeSize = {
  x: 200,
  y: 200,
};
export default function App() {
  const [familyChart, setFamilyChart] = useState({});

  const getChildrenList = (children) => {
    let childrenList = [];
    if ((children || []).length > 0) {
      children.forEach((obj) => {
        let attributes = {
          "नात ": obj?.relation?.value || "वडील",
          "जन्म तारीख ": obj.dob,
          "शिक्षण ": obj?.qualification?.value,
          // "उद्योग ": obj?.occupation?.value
        };
        if (!obj.isAlive) {
          attributes = {
            ...attributes,
            "मृत्यूची तारीख ": obj.dod,
          };
        }

        let spouse = obj?.spouse;

        let spouseAttributes = {
          "नात ": spouse?.relation?.value || "आई",
          "जन्म तारीख ": spouse?.dob,
          "शिक्षण ": spouse?.qualification?.value,
          // "उद्योग ": spouse?.occupation?.value
        };
        if (!spouse?.isAlive) {
          spouseAttributes = {
            ...spouseAttributes,
            "मृत्यूची तारीख ": spouse?.dod,
          };
        }

        spouse = {
          name: `${spouse?.firstName} ${spouse?.middleName} ${spouse?.lastName}`,
          attributes: spouseAttributes,
        };

        if (obj?.spouse) {
          childrenList.push({
            name: `${obj.id})${obj?.firstName} ${obj?.middleName} ${obj?.lastName}`,
            attributes,
            children: [spouse, ...getChildrenList(obj?.children || [])],
          });
        } else {
          childrenList.push({
            name: `${obj.id}) ${obj?.firstName} ${obj?.middleName} ${obj?.lastName}`,
            attributes,
            children: getChildrenList(obj?.children || null),
          });
        }
      });
    }
    return childrenList.length > 0 ? childrenList : "";
  };
  useEffect(() => {
    const getDetailsOverAPI = async () => {
      const response = await axios
        .get(
          `http://localhost:8000/members/${window.location.href.split("/")[3]||3}`,
          {
            headers: {
              Authorization:
                "Bearer eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoxLCJtb2JpbGVObyI6IjgyODY1NDQzNDIiLCJpZCI6MSwiZW1haWwiOiJraGFtYmVzdW1pdEBnbWFpbC5jb20iLCJ1c2VybmFtZSI6InN1bWl0Iiwic3ViIjoic3VtaXQiLCJpc3MiOiJraGFtYmUiLCJqdGkiOiIxIiwiaWF0IjoxNjQ2MzkwNjMyLCJleHAiOjE2NTkzNTA2MzJ9.qN81B-jA3ELRPQzFzIYWVkW7KZshxmv_SAgxr06gYnQ",
            },
          }
        )
        .then((res) => res.data)
        .catch((error) => error.data);

      let Family = response.data;
      let newFamilyChart = {};
      let attributes = {
        "नात ": "वडील",
        "जन्म तारीख ": Family.dob,
        "शिक्षण ": Family?.qualification?.value,
        // "उद्योग ": Family?.occupation?.value
      };
      if (!Family.isAlive) {
        attributes = {
          ...attributes,
          "मृत्यूची तारीख ": Family.dod,
        };
      }

      let spouse = Family?.spouse;

      let spouseAttributes = {
        "नात ": spouse?.relation?.value || "आई",
        "जन्म तारीख ": spouse?.dob,
        "शिक्षण ": spouse?.qualification?.value,
        // "उद्योग ": spouse?.occupation?.value
      };
      if (!spouse?.isAlive) {
        spouseAttributes = {
          ...spouseAttributes,
          "मृत्यूची तारीख ": spouse?.dod,
        };
      }

      spouse = {
        name: `${spouse?.firstName} ${spouse?.middleName} ${spouse?.lastName}`,
        attributes: spouseAttributes,
      };
      if (Family?.spouse) {
        newFamilyChart = {
          name: `${Family.id})${Family?.firstName} ${Family?.middleName} ${Family?.lastName}`,
          attributes,
          children: [spouse, ...getChildrenList(Family?.children || [])],
        };
      } else {
        newFamilyChart = {
          name: `${Family.id})${Family?.firstName} ${Family?.middleName} ${Family?.lastName}`,
          attributes,
          children: getChildrenList(Family?.children || []),
        };
      }
      setFamilyChart(newFamilyChart);
    };
    getDetailsOverAPI();
  }, []);
  return (
    <div className="container">
      <div id="treeWrapper" style={{ width: "100%", height: "100%" }}>
        <Tree
          data={familyChart}
          orientation={"vertical"}
          pathFunc={"step"}
          separation={separation}
          nodeSize={nodeSize}
          zoomable={true}
        />
      </div>
    </div>
  );
}
