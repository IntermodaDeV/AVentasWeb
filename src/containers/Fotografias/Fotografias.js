import React from "react";
import Dropzone from "react-dropzone-uploader";
import 'react-dropzone-uploader/dist/styles.css'

const Fotografias = (props) => {
    const getUploadParams = ({ meta }) => {
        const url = 'https://httpbin.org/post'
        return { url, meta: { fileUrl: `${url}/${encodeURIComponent(meta.name)}` } }
    }

    const handleChangeStatus = ({ meta }, status) => {
    }

    const handleSubmit = (files, allFiles) => {
        allFiles.forEach(f => f.remove())
    }

    return (
        <div className={"p-3"}>
            <Dropzone
                getUploadParams={getUploadParams}
                onChangeStatus={handleChangeStatus}
                onSubmit={handleSubmit}
                accept="image/*"
                inputContent={(files, extra) => (extra.reject ? 'Image, audio and video files only' : 'Drag Files')}
                styles={{
                    dropzoneReject: { borderColor: 'red', backgroundColor: '#DAA' },
                    inputLabel: (files, extra) => (extra.reject ? { color: 'red' } : {}),
                    dropzone: { overflow: 'auto' }

                }}
            />
        </div>
    )
}

export default Fotografias;