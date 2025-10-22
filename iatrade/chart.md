{
  "chart": {
    "type": "multi-line-chart",
    "title": "TOTAL ACCOUNT VALUE",
    "theme": "light",
    "background": "#f5f5f5",
    "dimensions": {
      "width": "100%",
      "height": "800px",
      "aspectRatio": "16:9"
    },
    "header": {
      "position": "top-center",
      "title": {
        "text": "TOTAL ACCOUNT VALUE",
        "fontSize": "14px",
        "fontWeight": "bold",
        "color": "#000000",
        "textAlign": "center"
      },
      "controls": {
        "position": "top-right",
        "buttons": [
          {
            "id": "all-time",
            "label": "ALL",
            "style": "filled",
            "backgroundColor": "#000000",
            "color": "#ffffff",
            "active": true
          },
          {
            "id": "72h",
            "label": "72H",
            "style": "outlined",
            "borderColor": "#000000",
            "color": "#000000",
            "active": false
          }
        ]
      },
      "logo": {
        "position": "top-left",
        "icon": "nof1-square",
        "size": "24px"
      }
    },
    "axes": {
      "xAxis": {
        "type": "datetime",
        "position": "bottom",
        "label": {
          "format": "MMM DD HH:mm",
          "color": "#666666",
          "fontSize": "11px"
        },
        "gridLines": {
          "show": true,
          "color": "#e0e0e0",
          "style": "solid",
          "width": "1px"
        },
        "range": {
          "start": "Oct 17 19:00",
          "end": "Oct 21 22:18"
        }
      },
      "yAxis": {
        "type": "linear",
        "position": "left",
        "label": {
          "format": "$#,###",
          "color": "#666666",
          "fontSize": "11px"
        },
        "gridLines": {
          "show": true,
          "color": "#e0e0e0",
          "style": "solid",
          "width": "1px"
        },
        "range": {
          "min": 4000,
          "max": 16000,
          "step": 2000
        }
      }
    },
    "referenceLine": {
      "type": "horizontal",
      "value": 10000,
      "color": "#999999",
      "style": "dashed",
      "width": "2px",
      "label": {
        "text": "$10,000 (Initial Balance)",
        "position": "right"
      }
    },
    "dataLines": [
      {
        "id": "trader-1",
        "name": "AI Trader 1",
        "color": "#4169e1",
        "strokeWidth": "2px",
        "style": "solid",
        "currentValue": 13304.00,
        "marker": {
          "show": true,
          "type": "circle",
          "color": "#4169e1",
          "size": "8px",
          "border": {
            "color": "#ffffff",
            "width": "2px"
          }
        },
        "label": {
          "position": "end",
          "text": "$13,304.00",
          "backgroundColor": "#4169e1",
          "color": "#ffffff",
          "padding": "4px 8px",
          "borderRadius": "4px",
          "fontSize": "11px"
        },
        "performance": {
          "startValue": 10000,
          "endValue": 13304.00,
          "change": 3304.00,
          "changePercent": 33.04,
          "trend": "up"
        }
      },
      {
        "id": "trader-2",
        "name": "AI Trader 2",
        "color": "#000000",
        "strokeWidth": "2px",
        "style": "solid",
        "currentValue": 10200.00,
        "marker": {
          "show": false
        },
        "performance": {
          "startValue": 10000,
          "endValue": 10200.00,
          "change": 200.00,
          "changePercent": 2.00,
          "trend": "up"
        }
      },
      {
        "id": "trader-3",
        "name": "AI Trader 3",
        "color": "#ff6347",
        "strokeWidth": "2px",
        "style": "solid",
        "currentValue": 8672.12,
        "marker": {
          "show": true,
          "type": "circle",
          "color": "#ff6347",
          "size": "8px",
          "border": {
            "color": "#ffffff",
            "width": "2px"
          }
        },
        "label": {
          "position": "end",
          "text": "$8,672.12",
          "backgroundColor": "#ff6347",
          "color": "#ffffff",
          "padding": "4px 8px",
          "borderRadius": "4px",
          "fontSize": "11px"
        },
        "performance": {
          "startValue": 10000,
          "endValue": 8672.12,
          "change": -1327.88,
          "changePercent": -13.28,
          "trend": "down"
        }
      },
      {
        "id": "trader-4",
        "name": "AI Trader 4",
        "color": "#9370db",
        "strokeWidth": "2px",
        "style": "solid",
        "currentValue": 10200.00,
        "marker": {
          "show": true,
          "type": "circle",
          "color": "#9370db",
          "size": "8px",
          "border": {
            "color": "#ffffff",
            "width": "2px"
          }
        },
        "label": {
          "position": "end",
          "text": "$10,200.00",
          "backgroundColor": "#9370db",
          "color": "#ffffff",
          "padding": "4px 8px",
          "borderRadius": "4px",
          "fontSize": "11px"
        },
        "performance": {
          "startValue": 10000,
          "endValue": 10200.00,
          "change": 200.00,
          "changePercent": 2.00,
          "trend": "up"
        }
      },
      {
        "id": "trader-5",
        "name": "AI Trader 5",
        "color": "#20b2aa",
        "strokeWidth": "2px",
        "style": "solid",
        "currentValue": 3999.02,
        "marker": {
          "show": true,
          "type": "circle",
          "color": "#20b2aa",
          "size": "8px",
          "border": {
            "color": "#ffffff",
            "width": "2px"
          }
        },
        "label": {
          "position": "end",
          "text": "$3,999.02",
          "backgroundColor": "#20b2aa",
          "color": "#ffffff",
          "padding": "4px 8px",
          "borderRadius": "4px",
          "fontSize": "11px"
        },
        "performance": {
          "startValue": 10000,
          "endValue": 3999.02,
          "change": -6000.98,
          "changePercent": -60.01,
          "trend": "down"
        }
      },
      {
        "id": "trader-6",
        "name": "AI Trader 6",
        "color": "#4682b4",
        "strokeWidth": "2px",
        "style": "solid",
        "currentValue": 6400.19,
        "marker": {
          "show": true,
          "type": "circle",
          "color": "#4682b4",
          "size": "8px",
          "border": {
            "color": "#ffffff",
            "width": "2px"
          }
        },
        "label": {
          "position": "end",
          "text": "$6,400.19",
          "backgroundColor": "#4682b4",
          "color": "#ffffff",
          "padding": "4px 8px",
          "borderRadius": "4px",
          "fontSize": "11px"
        },
        "performance": {
          "startValue": 10000,
          "endValue": 6400.19,
          "change": -3599.81,
          "changePercent": -35.99,
          "trend": "down"
        }
      }
    ],
    "legend": {
      "position": "end-of-lines",
      "style": "inline-badges",
      "showMarkers": true,
      "showValues": true,
      "fontSize": "11px"
    },
    "tooltip": {
      "enabled": true,
      "trigger": "hover",
      "style": {
        "backgroundColor": "rgba(0, 0, 0, 0.85)",
        "color": "#ffffff",
        "padding": "8px 12px",
        "borderRadius": "6px",
        "fontSize": "12px",
        "boxShadow": "0 2px 8px rgba(0,0,0,0.15)"
      },
      "content": [
        "trader_name",
        "timestamp",
        "value",
        "change",
        "change_percent"
      ]
    },
    "interactivity": {
      "zoom": {
        "enabled": true,
        "type": "scroll"
      },
      "pan": {
        "enabled": true,
        "type": "drag"
      },
      "hover": {
        "enabled": true,
        "highlightLine": true,
        "showCrosshair": true
      }
    },
    "animation": {
      "enabled": true,
      "duration": 1000,
      "easing": "ease-in-out"
    },
    "responsive": {
      "breakpoints": {
        "mobile": {
          "maxWidth": "768px",
          "adjustments": {
            "fontSize": "10px",
            "strokeWidth": "1.5px",
            "hideLabels": false
          }
        },
        "tablet": {
          "maxWidth": "1024px",
          "adjustments": {
            "fontSize": "11px"
          }
        }
      }
    },
    "watermark": {
      "enabled": true,
      "text": "nof1.ai",
      "position": "bottom-right",
      "opacity": 0.3,
      "fontSize": "12px",
      "color": "#999999"
    }
  }
}