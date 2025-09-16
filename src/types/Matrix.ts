export interface FormTypeItem {
  name: string;
  type: string;
  placeholder: string;
  required: boolean;
  options: {
    value: string;
    label: string;
  }[];
}

export interface FormType {
  name: string;
  items: FormTypeItem[];
}

export interface ColumnHeader {
  slug: string;
  name: string;
  form_type: FormType;
}



export interface RowHeaderOption {
  value: string;
  label: string;
}

export interface RowHeader {
  slug: string;
  name: string;
  options: RowHeaderOption[];
}

export interface MatrixHeaders {
  columnHeaders: ColumnHeader[];
  rowHeaders: RowHeader[];
}

export interface MatrixCellValue {
  [key: string]: string | number | boolean;
}

export interface MatrixCell {
  previous_value?: MatrixCellValue;
  value: MatrixCellValue;
  public_value?: MatrixCellValue;
  rowHeader: string;
  colHeader: string;
  type: string|undefined;
  selectedRowHeaderSubOptions?: RowHeaderOption[];
}

// interface MatrixCell {
//   previous_value?: {
//     [key: string]: string | number | boolean | undefined;
//   };
//   value: {
//     [key: string]: string | number | undefined;
//   };
//   public_value: {
//     [key: string]: string | number | undefined;
//   };
//   rowHeader: string;
//   colHeader: string;
//   type?: string;
//   selectedRowHeaderSubOptions?: { value: string; label: string }[];
// }

export interface MatrixData {
  [rowIndex: number]: MatrixCell[];
}

//row headears example
// const rowHeaders2=[{
//     name: "Header 1",
//     slug: "header_1",
//     options: [{value: "USD", label: "USD"}, {value: "EUR", label: "EUR"}, {value: "GBP", label: "GBP"}]
//   },
//   {
//     name: "Header 2",
//     slug: "header_2",
//     options: [{value: "USD", label: "USD2"}, {value: "EUR", label: "EUR2"}, {value: "GBP", label: "GBP2"}]
//   },
//   {
//     name: "Header 3",
//     slug: "header_3",
//     options: [{value: "USD", label: "USD3"}, {value: "EUR", label: "EUR3"}, {value: "GBP", label: "GBP3"}]
//   }
// ]
//column headears example
// const columnHeaders2= [
//     {
//     name: "Column 1", 
//     slug: "column_1",
//     form_type: {
//       name: "numberWithSelect", 
//       items: [
//         {
//           name:"column_1_number",
//           type: "number",
//           placeholder: "Enter a number"
//        }, 
//         {
//           name: "column_1_select", 
//           type: "single-select", 
//           options: [{value: "USD", label: "USD"}, {value: "EUR", label: "EUR"}, {value: "GBP", label: "GBP"}]
//         }
//       ]
//     }
//    },
//    {
//     name: "Column 2", 
//     slug: "column_2",
//     form_type: {
//       name: "number", 
//       items: [{name: "column_2_number", type: "number", placeholder: "Enter a number"}]
//     }
//    },
//    {
//     name: "Column 3", 
//     slug: "column_3",
//     form_type: {
//       name: "numberWithSelectWithSelect", 
//       items: [
//         {
//           name:"column_3_number",
//           type: "number",
//           placeholder: "Enter a number"
//        }, 
//         {
//           name: "column_3_select", 
//           type: "single-select", 
//           options: [{value: "USD", label: "USD"}, {value: "EUR", label: "EUR"}, {value: "GBP", label: "GBP"}]
//         },
//         {
//           name: "column_3_select_2", 
//           type: "single-select", 
//           options: [{value: "USD", label: "USD"}, {value: "EUR", label: "EUR"}, {value: "GBP", label: "GBP"}]
//         }
//       ]
//     }
//    },
//    {
//     name: "Column 4", 
//     slug: "column_4",
//     form_type: {
//       name: "text", 
//       items: [{name: "column_4_text", type: "text", placeholder: "Enter a text"}]
//     }
//    },
//    {
//     name: "Column 5d", 
//     slug: "column_5",
//     form_type: {
//       name: "textarea", 
//       items: [{name: "column_5_textarea", type: "textarea", placeholder: "Enter a text"}]
//     }
//    },
//    {
//     name: "Column 6", 
//     slug: "column_6",
//     form_type: {
//       name: "textareaWithNumericWithSelect", 
//       items: [
//         {name: "column_5_textarea", type: "textarea", placeholder: "Enter a text"},
//         {name: "column_6_number", type: "number", placeholder: "Enter a number"},
//         {name: "column_6_select", type: "single-select", options: [{value: "USD", label: "USD"}, {value: "EUR", label: "EUR"}, {value: "GBP", label: "GBP"}]}
//       ]
//     }
//    }
//  ]

//MatrixData example
// const initialMatrixData2 = [
//     [
//       {
//         value: {},
//         public_value:{},
//         rowHeader: rowHeaders[1]?.slug || '',
//         colHeader: columnHeaders[0]?.slug || '',
//         type: columnHeaders[0]?.form_type.name,
//         selectedRowHeaderSubOptions: [
//           { value: "row-subheader-1", label: "Row subheader 1" },
//           { value: "row-subheader-2", label: "Row subheader 2" }
//         ]
//       },
//       {
//         value:  {Number: 'jyykyk'},
//         rowHeader: rowHeaders[0]?.slug || '',
//         colHeader: columnHeaders[1]?.slug || '',
//         type: columnHeaders[1]?.form_type.name,
        
//       },
//       {
//         value:  {Number: '34', Currency: 'lots'},
        
//         rowHeader: rowHeaders[0]?.slug || '',
//         colHeader: columnHeaders[2]?.slug || '',
//         type: columnHeaders[2]?.form_type.name,
      
//       }
//     ]
//   ]
