function validateAgainstTemplate(schema, data) {
  for (const section of schema.sections) {
    for (const field of section.fields) {
      if (field.required) {
        if (data[field.id] === undefined) {
          return `Missing required field: ${field.id}`;
        }
      }
    }
  }
  return null;
}
