import{_ as p,r as v,P as x,o as a,c as r,a as t,t as l,F as h,A as f,q as g,ag as w}from"./index-Bzz802DQ.js";const b={class:"header flex-col"},S={class:"row company col-12"},T={class:"row col-12 row-inline"},k={class:"col-6 text-left"},C={class:"row customer col-12"},E={class:"col-12 product-name"},A={class:"items-table"},D={class:"footer flex-col"},P={class:"row col-12"},L={class:"col-6 text-right"},N={class:"col-6 text-left"},R={class:"row col-12"},G={class:"col-6 text-right"},I={key:0,class:"col-6 text-left"},$={class:"row col-12"},q={class:"col-6 text-right"},B={class:"col-6 text-left"},F={__name:"ThermalInstallmentPrint",props:{installment:{type:Object,required:!0},companyName:{type:String,default:"بدون اسم"}},setup(n,{expose:y}){const m=v(null);function c(o){return new Intl.NumberFormat("en-EG",{style:"currency",currency:"EGP"}).format(o||0)}function u(o){return o?new Date(o).toLocaleDateString("ar-EG"):""}x(()=>{const o=Array.from(document.querySelectorAll("style[scoped]"));let e="";o.forEach(s=>{try{const i=s.sheet;if(!i)return;for(const d of i.cssRules)d.type===CSSRule.STYLE_RULE&&d.selectorText.startsWith(".")&&(e+=`${d.cssText}
`)}catch{}}),console.log("Component Scoped CSS Rules:",e),window.__thermalPrintComponentCSS=e});function _(){w(()=>{const o=m.value;if(!o)return;const e=`<div class='thermal-print'>${o.innerHTML}</div>`,s=window.__thermalPrintComponentCSS||"",i=window.open("","","width=1000,height=800,left=200,top=50");i.document.write(`
          <html>
            <head>
              <title>طباعة خطة أقساط حرارية</title>
              <link rel="stylesheet" href="/dist/assets/index-Dmm87GDT.css">
              <link rel="icon" type="image/svg+xml" href="/images/printer-line.svg">
              <style>
                /* Scoped component styles */
                ${s}
                /* يمكن إضافة أي تخصيص إضافي هنا إذا لزم */
                body { margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; height: 100vh; background: #fff; }
                .thermal-print { width: 260px; font-size: 13px; font-family: 'Tahoma', 'Arial', sans-serif; direction: rtl; color: #000; }
                 .items-table { border: none; } 
                 .row { padding: 2px 0; }
                 .col-12 { padding: 2px 0; }
                .items-table th, .items-table td { border-bottom: 2px solid #000;padding: 3px 0; text-align: center; }
              </style>
            </head>
            <body>
              ${e}
            </body>
          </html>
        `),i.document.close(),i.focus(),setTimeout(()=>{i.print(),i.close()},300)})}return y({printThermal:_}),(o,e)=>(a(),r("div",{class:"thermal-print",ref_key:"printArea",ref:m},[t("div",b,[t("div",S,l(n.companyName),1),t("div",T,[t("div",k,"تاريخ الخطة: "+l(u(n.installment.updated_at||n.installment.created_at)),1)]),t("div",C,"العميل: "+l(n.installment.user.full_name),1),e[0]||(e[0]=t("div",{class:"row col-12 product-header"},"المنتجات:",-1)),(a(!0),r(h,null,f(n.installment.invoice_items,s=>(a(),r("div",{class:"row product-item",key:s.id},[t("div",E,"- "+l(s.name),1)]))),128))]),e[2]||(e[2]=t("hr",null,null,-1)),t("table",A,[e[1]||(e[1]=t("thead",null,[t("tr",null,[t("th",null,"الرقم"),t("th",null,"تاريخ الاستحقاق"),t("th",null,"الحالة")])],-1)),t("tbody",null,[(a(!0),r(h,null,f(n.installment.installments,s=>(a(),r("tr",{key:s.id},[t("td",null,l(s.installment_number),1),t("td",null,l(u(s.due_date)),1),t("td",null,l(s.status_label),1)]))),128))])]),e[3]||(e[3]=t("hr",null,null,-1)),t("div",D,[t("div",P,[t("div",L,"إجمالي الخطة: "+l(c(n.installment.total_amount)),1),t("div",N,"الدفعة الأولى: "+l(c(n.installment.down_payment)),1)]),t("div",R,[t("div",G,"المتبقي: "+l(c(n.installment.remaining_amount)),1),n.installment.notes?(a(),r("div",I,"ملاحظات: "+l(n.installment.notes),1)):g("",!0)]),t("div",$,[t("div",q,"عدد الأقساط: "+l(n.installment.number_of_installments),1),t("div",B,"إجمالي الأقساط: "+l(c(n.installment.total_installments_amount)),1)])])],512))}},M=p(F,[["__scopeId","data-v-18cfe05b"]]);export{M as default};
