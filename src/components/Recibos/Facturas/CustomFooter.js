import React from "react";
import { TableCell, TablePagination } from "@material-ui/core";

const CustomFooter = (props) => {
    let { count, page, rowsPerPage, changeRowsPerPage, changePage, textLabels } = props


    const handleRowChange = event => {
        changeRowsPerPage(event.target.value);
    };

    const handlePageChange = (_, page) => {
        changePage(page);
    };

    const isValidCustom = () => {
        if (props.CustomButtonComponent) {
            if (props.CustomButton) {
                return true;
            }
        }
        return false;
    }

    return (

        <tfoot>
            <tr>
                {
                    isValidCustom() &&
                    <TableCell style={{ width: 'calc((1/5)*100%)' }}>
                        {props.CustomButtonComponent}
                    </TableCell>
                }
                {props.pagination && (
                    <TableCell style={{ justifyContent: 'flex-end', padding: '0px 24px 0px 24px' }} colSpan={1000}>
                        <TablePagination
                            component="div"
                            count={count}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            labelRowsPerPage={textLabels.rowsPerPage}
                            labelDisplayedRows={({ from, to, count }) => `${from}-${to} ${textLabels.displayRows} ${count}`}
                            backIconButtonProps={{
                                'aria-label': textLabels.previous,
                            }}
                            nextIconButtonProps={{
                                'aria-label': textLabels.next,
                            }}
                            rowsPerPageOptions={[10, 20, 100]}
                            onChangePage={handlePageChange}
                            onChangeRowsPerPage={handleRowChange}
                        />
                    </TableCell>)}
            </tr>
        </tfoot >
    );
}
export default CustomFooter;