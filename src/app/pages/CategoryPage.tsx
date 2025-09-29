// src/app/pages/CategoryPage.tsx
import React from "react";
import { useParams } from "react-router-dom";
import { Container } from "react-bootstrap";

const CategoryPage: React.FC = () => {
  const { categoryId } = useParams();
  
  return (
    <Container>
      <div className="py-5">
        <h1>Category: {categoryId}</h1>
        <p>Category page implementation coming soon...</p>
      </div>
    </Container>
  );
};

export default CategoryPage;
