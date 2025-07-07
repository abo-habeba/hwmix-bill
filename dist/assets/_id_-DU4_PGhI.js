import{_ as I,r as d,Q as N,c as v,d as a,k as o,aI as S,ar as T,o as s,a5 as m,a6 as c,W as _,a as x,aa as f,b as p,l as h,s as y,F as B,B as R,g as $}from"./index-BSXXG_1r.js";import L from"./ThermalInvoicePrint-CjtGKjkt.js";import{P as M}from"./ProductSticker-C7SW6mPq.js";const P={class:"print-page"},j="اسم الشركة",z={__name:"[id]",setup(A){const k=$(),n=d(null),u=d(!1),i=d(null),g=d([]);async function b(){const l=sessionStorage.getItem("print_invoice");if(l)try{n.value=JSON.parse(l),sessionStorage.removeItem("print_invoice");return}catch{}const t=k.params.id;if(!t)return;const e=await T("invoices",t);n.value=(e==null?void 0:e.data)||null}N(b);function w(){if(!i.value)return;const t=`
      <div class='thermal-print'>${(i.value.$el||i.value).innerHTML}</div>
    `,e=window.open("","","width=400,height=700,left=200,top=50");e.document.write(`
      <html>
        <head>
          <title>طباعة فاتورة حرارية</title>
          <style>
            body { margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; height: 100vh; background: #fff; }
            .thermal-print { width: 260px; font-size: 13px; font-family: 'Tahoma', 'Arial', sans-serif; direction: rtl; color: #000; }
            .header, .footer { text-align: center; margin-bottom: 8px; }
            .items-table { width: 100%; border-collapse: collapse; }
            .items-table th, .items-table td { border-bottom: 1px dashed #aaa; padding: 2px 0; text-align: center; }
            hr { border: none; border-top: 1px dashed #aaa; margin: 6px 0; }
          </style>
        </head>
        <body>
          ${t}
        </body>
      </html>
    `),e.document.close(),e.focus(),setTimeout(()=>{e.print(),e.close()},300)}function C(l){const t=n.value.items.findIndex(V=>V.product_id===l.product_id),e=document.querySelectorAll(".sticker-print")[t];if(!e)return;const r=window.open("","","width=180,height=200");r.document.write('<html><head><title>ستيكر منتج</title></head><body dir="rtl">'),r.document.write(e.outerHTML),r.document.write("</body></html>"),r.document.close(),r.focus(),r.print(),r.close()}return(l,t)=>(s(),v("div",P,[a(S,null,{default:o(()=>[a(m,null,{default:o(()=>[a(c,{cols:"12",md:"8",class:"mx-auto"},{default:o(()=>[a(_,{class:"pa-4 mb-4"},{default:o(()=>[a(m,{align:"center",justify:"space-between"},{default:o(()=>[a(c,{cols:"12",md:"6"},{default:o(()=>t[1]||(t[1]=[x("h2",{class:"text-h5"},"معاينة طباعة الفاتورة",-1)])),_:1}),a(c,{cols:"12",md:"6",class:"text-md-end text-center"},{default:o(()=>[a(f,{color:"primary",onClick:w},{default:o(()=>t[2]||(t[2]=[p("طباعة حرارية")])),_:1}),a(f,{color:"info",onClick:t[0]||(t[0]=e=>u.value=!u.value)},{default:o(()=>t[3]||(t[3]=[p("طباعة ستيكر منتج")])),_:1})]),_:1})]),_:1}),n.value?(s(),h(L,{key:0,invoice:n.value,companyName:j,ref_key:"thermalRef",ref:i},null,8,["invoice"])):y("",!0)]),_:1}),u.value&&n.value&&n.value.items?(s(),h(_,{key:0,class:"pa-4"},{default:o(()=>[t[5]||(t[5]=x("h3",{class:"text-h6 mb-2"},"ستيكرات المنتجات",-1)),a(m,null,{default:o(()=>[(s(!0),v(B,null,R(n.value.items,e=>(s(),h(c,{key:e.product_id,cols:"6",sm:"4",md:"3"},{default:o(()=>[a(M,{product:{name:e.name,serial:e.serial||e.product_id,price:e.unit_price},ref_for:!0,ref_key:"stickerRefs",ref:g},null,8,["product"]),a(f,{color:"info",size:"small",class:"mt-2",onClick:r=>C(e)},{default:o(()=>t[4]||(t[4]=[p("طباعة هذا المنتج")])),_:2},1032,["onClick"])]),_:2},1024))),128))]),_:1})]),_:1})):y("",!0)]),_:1})]),_:1})]),_:1})]))}},q=I(z,[["__scopeId","data-v-e0026685"]]);export{q as default};
