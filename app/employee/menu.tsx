
import { Redirect } from 'expo-router';

// This redirects to the customer menu page so employees can view menus
export default function EmployeeMenuRedirect() {
  return <Redirect href="/(tabs)/menu" />;
}
