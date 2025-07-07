import React, { useState, useEffect, useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { Box, Button, Typography } from "@mui/material";
import { toast } from "react-toastify";

const pink = "#ec008c";

const FullScreenEditor = () => {
  const [content, setContent] = useState("");
  const editorRef = useRef(null);

  useEffect(() => {
    const savedContent = localStorage.getItem("landingPageHtml");
    setContent(savedContent || "");
  }, []);

  const handleSaveAndClose = () => {
    const updatedHtml = editorRef.current?.getContent() || content;
    localStorage.setItem("landingPageHtml", updatedHtml);
    toast.success("✅ Content saved successfully!");
    window.close();
  };

  return (
    <Box
      sx={{
        p: 2,
        height: "90vh",
        backgroundColor: "#f5f5fa",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography
        variant="h6"
        fontWeight="bold"
        sx={{ color: pink, mb: 2, textAlign: "center" }}
      >
        📝 Full Screen Landing Page Editor
      </Typography>

      <Box sx={{ flexGrow: 1 }}>
        <Editor
          onInit={(evt, editor) => (editorRef.current = editor)}
          apiKey="o8z0kqre5x0f3nnn3x68nryugconi6gdd9ql2sc12r0wj5ok"
          value={content}
          onEditorChange={(newValue) => setContent(newValue)}
          init={{
            height: "100%",
            menubar: false,
            plugins: [
              "anchor",
              "autolink",
              "charmap",
              "codesample",
              "emoticons",
              "image",
              "link",
              "lists",
              "media",
              "searchreplace",
              "table",
              "visualblocks",
              "wordcount",
            ],
            toolbar:
              "undo redo | blocks fontfamily fontsize | " +
              "bold italic underline strikethrough | " +
              "link image media table mergetags | " +
              "addcomment showcomments | " +
              "spellcheckdialog a11ycheck typography | " +
              "align lineheight | checklist numlist bullist indent outdent | " +
              "emoticons charmap | removeformat",
            branding: false,
          }}
        />
      </Box>

      <Box mt={2} textAlign="center">
        <Button
          onClick={handleSaveAndClose}
          variant="contained"
          sx={{
            px: 4,
            background: `linear-gradient(to right, ${pink}, #d946ef)`,
          }}
        >
          Save & Close
        </Button>
      </Box>
    </Box>
  );
};

export default FullScreenEditor;
