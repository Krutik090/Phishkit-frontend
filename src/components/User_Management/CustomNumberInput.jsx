// import React from 'react';
// import {
//     Unstable_NumberInput as BaseNumberInput,
// } from '@mui/base/Unstable_NumberInput';
// import { styled } from '@mui/system';
// import RemoveIcon from '@mui/icons-material/Remove';
// import AddIcon from '@mui/icons-material/Add';

// const pink = localStorage.getItem("primaryColor");

// const CustomNumberInput = React.forwardRef((props, ref) => {
//     return (
//         <BaseNumberInput
//             slots={{
//                 root: StyledInputRoot,
//                 input: StyledInput,
//                 incrementButton: StyledButton,
//                 decrementButton: StyledButton,
//             }}
//             slotProps={{
//                 incrementButton: {
//                     children: <AddIcon fontSize="small" />,
//                     className: 'increment',
//                 },
//                 decrementButton: {
//                     children: <RemoveIcon fontSize="small" />,
//                 },
//             }}
//             {...props}
//             ref={ref}
//         />
//     );
// });

// export default CustomNumberInput;

// const StyledInputRoot = styled('div')`
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   gap: 20px; /* <- Add spacing between all three items */
//   margin-bottom: px;
// `;

// const StyledInput = styled('input')`
//   font-size: 0.875rem;
//   font-family: inherit;
//   font-weight: 500;
//   text-align: center;
//   color: #000;
//   background: #fff;
//   border: 1px solid ${pink}60;
//   box-shadow: 0 0 0 2px ${pink}10;
//   border-radius: 8px;
//   padding: 10px 12px;
//   outline: none;
//   width: 4rem;

//   &:hover {
//     border-color: ${pink};
//   }

//   &:focus {
//     border-color: ${pink};
//     box-shadow: 0 0 0 3px ${pink}40;
//   }
// `;

// const StyledButton = styled('button')`
//   width: 32px;
//   height: 32px;
//   background: #f5f5f5;
//   border: 1px solid ${pink}40;
//   color: ${pink};
//   border-radius: 999px;
//   display: flex;
//   align-items: center;
//   justify-content: center;

//   &:hover {
//     cursor: pointer;
//     background: ${pink};
//     color: white;
//   }

//   &.increment {
//     order: 1;
//   }
// `;
