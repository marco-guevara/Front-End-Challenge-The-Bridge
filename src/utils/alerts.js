import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

const alertTheme = {
  background: "#111725",
  color: "#ecfeff",
};

async function confirmAction({
  title,
  text,
  confirmButtonText = "Confirm",
  icon = "question",
  confirmButtonColor,
}) {
  const result = await Swal.fire({
    ...alertTheme,
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText: "Cancel",
    confirmButtonColor:
      confirmButtonColor || (icon === "warning" ? "#ef4444" : "#16a34a"),
    cancelButtonColor: "#64748b",
  });

  return result.isConfirmed;
}

async function showSuccess(title, text) {
  await Swal.fire({
    ...alertTheme,
    title,
    text,
    icon: "success",
    confirmButtonText: "OK",
    confirmButtonColor: "#0dd1e7",
  });
}

async function showError(title, text) {
  await Swal.fire({
    ...alertTheme,
    title,
    text,
    icon: "error",
    confirmButtonText: "OK",
    confirmButtonColor: "#ef4444",
  });
}

export { confirmAction, showError, showSuccess };
