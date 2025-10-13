import emailjs from "emailjs-com";

export async function sendIssueReportEmail(emailid, name, title, description) {
    try{
        const templateParams = {
            email: emailid,
            name: name,
            title: title,
            description: description,
        };

        const response = await emailjs.send(
            import.meta.env.VITE_EMAILJS_SERVICE_ID,
            import.meta.env.VITE_EMAILJS_TEMPLATE_1_ID,
            templateParams,
            import.meta.env.VITE_EMAILJS_PUBLIC_KEY
        );

        console.log("Issue report email sent:", response);
    }
    catch(error){
        console.error("error sending issue report email:", error);
        throw new Error("error sending report! please try after some time");
    }
}


export async function sendNewKeyGenerationEmail(emailid) {
    try{
        const templateParams = {
            email: emailid,
        };

        const response = await emailjs.send(
            import.meta.env.VITE_EMAILJS_SERVICE_ID,
            import.meta.env.VITE_EMAILJS_TEMPLATE_2_ID,
            templateParams,
            import.meta.env.VITE_EMAILJS_PUBLIC_KEY
        );

        console.log("new recovery key generation email sent:", response);
    }
    catch(error){
        console.error("error sending issue report email:", error);
    }
}

